<script lang="ts">
  import { onMount } from 'svelte';
  import dayjs from 'dayjs';
	import {fetchData, religion, width} from '$lib/store'
  import type {Video, VideoData, VideoMeta} from '$lib/types'
	import Hero from '$lib/Hero.svelte'

  let videos: Video[] = []
  let meta: VideoMeta = {count:0, limit: $width > 750 ? 20 : 10, page:1, pages:0}
  let busy = false
  let total = 0

  const getVideos = async () => {
    busy = true
    const data: VideoData = await fetchData(`videos?religion=${$religion?.id}&page=${meta.page}&limit=${meta.limit}`)
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
	});
</script>

{#if $religion?.id}
  <Hero
    alt={`Religion: ${$religion.name}`}
    image={$religion.slug}
    title={`Videos about ${$religion.name} and related topics`}
  />

  <div id="about" class="leading mt-2 mx-auto px">
    <p>Please note that the videos presented here reflect the opinions of their respective creators regarding religions and their teachings. The creators are solely responsible for the content of the videos, and they retain the copyrights to their work. We apologize if the content of the videos causes any distress or discomfort.</p>
  </div>

  {#if Array.isArray(videos) && videos[0]}
    <div id="videos-count" class="mb-2 mt-2 px text-center"><strong aria-live="polite">Results: {total} / {meta.count} videos</strong></div>

    <ul id="videos" class="gap grid grid-4 m-0 px" role="feed" aria-busy={busy}>
      {#each videos as video, index}
        <div aria-posinset={index + 1} aria-setsize={total} aria-labelledby={`title-${video.id}`}>
          <a href={video.video_url}>
            <div class="video-image" aria-hidden="true">
              <img class="block h-full object-cover rounded w-full" src={video.video_image} alt={`${$religion.name} on YouTube: ${video.video_title}`} width=320 height=180 decoding="async" loading="lazy"/>
            </div>

            <div id={`title-${video.id}`} class="video-name">{video.video_title}</div>

            <div class="video-info">
              <time datetime={video.created}>{dayjs(video.created).format('DD.MM.YYYY')}</time>
            </div>
          </a>
        </div>
      {/each}
    </ul>

    {#if meta.next}
      <div id="action-buttons" class="mt-3 text-center">
        <button on:click={() => changePage(Number(meta.next))} class="bg-primary btn rounded text-white uppercase" disabled={!meta.next}>Load next {meta.limit} videos</button>
      </div>
    {/if}
  {/if}
{/if}