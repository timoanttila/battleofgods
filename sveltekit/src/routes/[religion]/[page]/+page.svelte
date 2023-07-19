<script lang="ts">
  import { hero, religion } from '$lib/store'
  import Comments from '$lib/Comments.svelte'
  import PageEdit from '$lib/PageEdit.svelte'
  import type {Page} from '$lib/types'

  export let data: Page

  $: if (data.id) {
    const religionLink = `/${$religion?.slug}`

    const pages = [
      {name: String($religion?.name), url: religionLink},
      {name: data.title, url: `${religionLink}/${data.slug}`}
    ]

    $hero = {
      alt: `Religion: ${$religion?.name}`,
      description: data.description,
      image: String($religion?.slug),
      pages,
      title: `What ${$religion?.name} teaches about ${data.title}`
    }
  }
</script>

<svelte:head>
  <meta content={data.created} name="pubdate" property="og:pubdate"/>
  <meta content={data.created} property="article:published_time"/>
  <meta content={data.updated} name="revised" property="article:modified_time"/>
</svelte:head>

{@html data.content}

<PageEdit content={data.content} id={data.id}/>
<Comments id={data.id}/>