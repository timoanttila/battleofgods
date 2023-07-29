<script lang="ts">
  import {page} from '$app/stores'
  import {hero, host, religion, siteName} from '$lib/store'

  interface BreadcrumbItem {
    '@type': string
    item: string
    name: string
    position: number
  }

  $: breadcrumb = <BreadcrumbItem[] | null>null
  $: imageUrl = `/images/${$hero?.image}`
  $: metaTitle = $siteName === $hero?.title ? $hero?.title : `${$hero?.title} | ${$siteName}`
  $: ldjson = <string>''

  $: if ($hero?.pages) {
    breadcrumb = [
      {
        '@type': 'ListItem',
        name: 'Home',
        item: '/',
        position: 1
      },
      ...$hero?.pages.map((page, position) => ({
        '@type': 'ListItem',
        name: page.name,
        item: page.url,
        position: position + 2
      }))
    ]

    ldjson = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":${JSON.stringify(breadcrumb)}}${'<'}/script>`
  } else {
    breadcrumb = null
    ldjson = ''
  }
</script>

<svelte:head>
  <title>{metaTitle}</title>
  <meta name="twitter:title" property="og:title" content={$hero?.title} />
  <meta name="description" content={$hero?.description ?? $religion?.description} />
  <meta name="twitter:description" property="og:description" content={$hero?.description ?? $religion?.description} />
  <meta name="canonical" property="og:url" content={`${$host}${$page.url.pathname}`} />
  <meta name="twitter:image" property="og:image" content={`${$host}${imageUrl}-1350.webp`} />
  {@html ldjson}
</svelte:head>

<div id="hero" class="relative text-center">
  <img id="hero-image" class="block h-full object-cover w-full" srcset={`${imageUrl}-400.webp 400w, ${imageUrl}-635.webp 635w, ${imageUrl}-1350.webp 1350w`} sizes="(max-width: 500px) 400px, (max-width: 768px) 635px, 1350px" src={`${imageUrl}-1350.webp`} alt={$hero?.alt} width="1350" height="500" decoding="async" loading="eager" aria-hidden="true" />
  <div id="hero-content" class="absolute bottom-6 left-0 text-center w-full">
    <h1 class="leading-tight m-0 mx-auto text-white">{$hero?.title}</h1>
  </div>
</div>

{#if Array.isArray(breadcrumb)}
  <ol id="breadcrumb" class="p-0" vocab="https://schema.org/" typeof="BreadcrumbList">
    {#each breadcrumb as page (page.item)}
      <li property="itemListElement" typeof="ListItem">
        <a href={page.item} property="item" typeof="WebPage">
          <span property="name">{page.name}</span>
        </a>
        <meta property="position" content={String(page.position)} />
      </li>
    {/each}
  </ol>
{/if}
