export async function getRepositories(page: number, controller?: AbortController): Promise<Video[]> {
  const resp = await fetch(`https://api.battleofgods.net/videos?page=${page}&religion=1`, {
    signal: controller?.signal
  })
  const json = await resp.json()
  if (Array.isArray(json?.data)) {
    return json.data
  } else {
    throw new Error('Failed to fetch repositories')
  }
}

import {component$, useStore, Resource, useResource$} from '@builder.io/qwik'

interface Speaker {
  id: number
  firstname: string
  lastname: string
}

interface Topic {
  id: number
  name: string
}

interface Video {
  created: string
  id: number
  religion_id: number
  religion_name: string
  speakers: Speaker[]
  topics: Topic[]
  video_id: string
  video_image: string
  video_length: number
  video_title: string
  video_url: string
}

export default component$(() => {
  const store = useStore({
    page: 1
  })

  const reposResource = useResource$<Video[]>(async ({track, cleanup}) => {
    track(() => store.page)

    const controller = new AbortController()
    cleanup(() => controller.abort())

    try {
      const data = await getRepositories(store.page, controller)
      return data
    } catch (error) {
      throw error
    }
  })

  return (
    <Resource
      value={reposResource}
      onPending={() => <div>Loading...</div>}
      onRejected={reason => <div>Error: {reason}</div>}
      onResolved={data => (
        <div id="videos">
          {data.map(video => (
            <a key={video.id} href={video.video_url} aria-aria-labelledby={`video-title-${video.id}`}>
              <img src={video.video_image} alt={video.video_title} loading="lazy" aria-hidden="true" />
              <div id={`video-title-${video.id}`} class="video_name">
                {video.video_title}
              </div>
              <div class="video_info">
                <span id={`video-created-${video.id}`}>{video.created}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    />
  )
})

export async function getRepositories(page: number, controller?: AbortController): Promise<Video[]> {
  const resp = await fetch(`https://api.battleofgods.net/videos?page=${page}&religion=1`, {
    signal: controller?.signal
  })
  const json = await resp.json()
  if (Array.isArray(json?.data)) {
    return json.data
  } else {
    throw new Error('Failed to fetch repositories')
  }
}
