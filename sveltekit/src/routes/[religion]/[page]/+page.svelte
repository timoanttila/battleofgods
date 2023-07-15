<script lang="ts">
  import {religion} from '$lib/store'
  import Hero from '$lib/Hero.svelte'
  import type {Page} from '$lib/types'

  export let data: Page

  const religionLink = `/${$religion?.slug}`
  const pages = [
    {name: String($religion?.name), url: religionLink},
    {name: data.title, url: `${religionLink}/${data.slug}`}
  ]
</script>

{#if $religion?.id && data?.title}
  <Hero
  alt={`Religion: ${$religion.name}`}
  description={data.description}
  image={$religion.slug}
  {pages}
  title={`What ${$religion?.name} teaches about ${data.title}`}
  />

  <div id="content" class="leading mt-1 px">{@html data.content}</div>
{/if}