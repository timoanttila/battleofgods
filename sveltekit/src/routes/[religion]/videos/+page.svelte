<script lang="ts">
  import {onMount} from 'svelte'
  import dayjs from 'dayjs'
  import {fetchData, hero, religion, width} from '$lib/store'
  import type {Video, VideoData, Filter, VideoMeta} from '$lib/types'

  let videos: Video[] = [],
    meta: VideoMeta = {count: 0, limit: $width > 750 ? 20 : 10, page: 1, pages: 0},
    busy = false,
    total = 0,
    topic = 0,
    topics: Filter[] = []

  const getVideos = async (reset: boolean = false) => {
    busy = true

    if (reset) {
      videos = []
    }

    let query = `religions/${$religion?.id}/videos?page=${meta.page}&limit=${meta.limit}`
    if (topic > 0) {
      query += `&topic=${topic}`
    }

    const data: VideoData = await fetchData(query)
    if (!data?.meta || data.meta?.count === 0) {
      busy = false
      return
    }

    videos = [...videos, ...data.data]
    meta = data.meta
    total = meta.next ? meta.page * meta.limit : meta.count
    busy = false
  }

  const changePage = (value: number) => {
    if (!value) {
      return
    }

    meta.page = value
    getVideos()
  }

  onMount(async () => {
    getVideos()
    topics = await fetchData(`religions/${$religion?.id}/topics/videos`)
  })

  $: {
    const religionLink = `/${$religion?.slug}`
    const pages = [
      {name: String($religion?.name), url: religionLink},
      {name: 'Videos', url: `${religionLink}/videos`}
    ]

    $hero = {
      alt: `Religion: ${$religion?.name}`,
      description: 'Videos about theology, history and incredible miracles.',
      image: String($religion?.slug),
      pages,
      title: `Videos about ${$religion?.name} and related topics`
    }
  }
</script>

<div id="about" class="leading mx-auto">
  <p>Please note that the videos presented here reflect the opinions of their respective creators regarding religions and their teachings. The creators are solely responsible for the content of the videos, and they retain the copyrights to their work. We apologize if the content of the videos causes any distress or discomfort.</p>
</div>

{#if Array.isArray(topics) && topics.length > 1}
  <div id="filters" class="mt-2 text-center">
    <div class="inline-block input">
      <label for="select-topic" class="block">Topics</label>
      <select bind:value={topic} on:change={() => getVideos(true)} id="select-topic" class="bg-white block w-full">
        <option value={0}>No choice</option>
        {#each topics as topic}
          <option value={topic.id}>{topic.name} ({topic.total})</option>
        {/each}
      </select>
    </div>
  </div>
{/if}

<div id="videos-count" class="mb-2 mt-1 text-center"><strong aria-live="polite">Results: {total} / {meta.count} videos</strong></div>

<div id="videos" class="gap grid grid-4 m-0" role="feed" aria-busy={busy}>
  {#if Array.isArray(videos) && videos[0]}
    {#each videos as video, index}
      <div aria-posinset={index + 1} aria-setsize={total} aria-labelledby={`title-${video.id}`}>
        <a href={video.video_url} aria-label={`${$religion?.name} on YouTube: ${video.video_title}`}>
          <div class="video-image" aria-hidden="true">
            <img class="block h-full object-cover rounded w-full" src={video.video_image} alt={`YouTube: ${video.video_title}`} width="320" height="180" decoding="async" loading="lazy" aria-hidden="true" />
          </div>

          <div id={`title-${video.id}`} class="video-name">{video.video_title}</div>

          <div class="video-info">
            <time datetime={video.created}>{dayjs(video.created).format('DD.MM.YYYY')}</time>
          </div>
        </a>
      </div>
    {/each}
  {/if}
</div>

{#if Array.isArray(videos) && videos[0] && meta.next}
  <div id="action-buttons" class="mt-3 text-center">
    <button on:click={() => changePage(Number(meta.next))} class="bg-blue" disabled={!meta.next}>Load next {meta.limit} videos</button>
  </div>
{/if}
