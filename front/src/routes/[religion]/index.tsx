import {component$, useStore, Resource, useResource$} from '@builder.io/qwik'
import {routeLoader$} from '@builder.io/qwik-city'
import type {DocumentHead} from '@builder.io/qwik-city'

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

interface Meta {
  count: number
  limit: number
  page: number
  pages: number
}

interface FetchData {
  data: Video[]
  meta: Meta
}

export const videos = routeLoader$(async requestEvent => {
  // This code runs only on the server, after every navigation
  const params = ['page', 'limit', 'topic']
  let query = ''

  for (const param in params) {
    if (requestEvent.params[param]) {
      query += `&${param}=${requestEvent.params[param]}`
    }
  }

  const res = await fetch(`https://api.battleofgods.net/videos?religion=1${query}`)
  const videos = await res.json()
  return videos as FetchData
})

export default component$(() => {
  const signal = videos()

  return (
    <Resource
      value={signal}
      onPending={() => <div>Loading...</div>}
      onRejected={reason => <div>Error: {reason}</div>}
      onResolved={data => (
        <div id="videos">
          {data.data.map(video => (
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

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
  meta: [
    {
      name: 'description',
      content: 'Qwik site description'
    }
  ]
}
