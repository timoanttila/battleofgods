<script lang="ts">
  export let pages: any[] = []
  let breadcrumb = [
    {
      name: 'Home',
      item: '/',
      position: 1
    }
  ]

  for (let position = 0; position < pages.length; position++) {
    const page = pages[position]
    breadcrumb.push({
      name: page.name,
      item: page.url,
      position: position + 2
    })
  }
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`}
</svelte:head>

<ol id="breadcrumb" class="p-0" vocab="https://schema.org/" typeof="BreadcrumbList">
  {#each breadcrumb as page}
    <li property="itemListElement" typeof="ListItem">
      <a href={page.item} property="item" typeof="WebPage">
        <span property="name">{page.name}</span>
      </a>
      <meta property="position" content={String(page.position)} />
    </li>
  {/each}
</ol>