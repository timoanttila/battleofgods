import {component$, Resource, useResource$, useSignal, $} from '@builder.io/qwik'
import {routeLoader$, useLocation, DocumentHead} from '@builder.io/qwik-city'
import Hero from '../../components/hero'

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

interface VideoData {
  data: Video[]
  meta: Meta
}

interface PageData {
  id: number
  name: string
  description: string
  limit: number
  page: number
  religion_id: number
}

const host = 'https://api.battleofgods.net/'

export const getPage = routeLoader$(async (requestEvent): Promise<PageData> => {
  const res = await fetch(`${host}religions?slug=${requestEvent.params['religion'].replace(/([^a-z])/gi, '').toLowerCase()}`)
  return await res.json()
})

const getVideos = async (religion: string, pageNumber: number, pageSize: number, topic: number, controller?: AbortController): Promise<VideoData> => {
  console.log(new Date(), `${host}videos?page=${pageNumber}&limit=${pageSize}&religion=${religion}&topic=${topic}`)
  const resp = await fetch(`${host}videos?page=${pageNumber}&limit=${pageSize}&religion=${religion}&topic=${topic}`, {
    signal: controller?.signal
  })
  const json = await resp.json()
  if (Array.isArray(json?.data)) {
    return json
  } else {
    throw new Error('Failed to fetch videos')
  }
}

export default component$(() => {
  const location = useLocation()
  const religion = location.params.religion.replace(/([^a-z])/gi, '').toLowerCase()

  const page = getPage()
  const pageSize = useSignal(20)
  const pageNumber = useSignal(1)
  const topic = useSignal(0)

  const params = location.url.searchParams
  for (const param of params) {
    const paramName = param[0]
    const paramValue = Number(param[1])
    switch (paramName) {
      case 'limit':
        pageSize.value = paramValue
        break
      case 'page':
        pageNumber.value = paramValue
        break
      case 'topic':
        topic.value = paramValue
        break
    }
  }

  const pageChange = $((value: number) => (pageNumber.value = value))

  const videos = useResource$<VideoData>(async ({track, cleanup}) => {
    track(() => pageNumber.value)

    const controller = new AbortController()
    cleanup(() => controller.abort())

    try {
      const data = await getVideos(religion, pageNumber.value, pageSize.value, topic.value, controller)

      return data
    } catch (error) {
      throw error
    }
  })

  return (
    <>
      <Resource
        value={page}
        onPending={() => <div>Loading...</div>}
        onRejected={reason => <div>Error: {reason}</div>}
        onResolved={data => (
          <>
            <Hero title={`What is ${data.name}?`} image={religion} alt={data.name} />
            <div id="description" dangerouslySetInnerHTML={data.description} />
            <h2 class="text-center video-title">Videos about {data.name} and related topics</h2>
          </>
        )}
      />

      <Resource
        value={videos}
        onPending={() => <div>Loading...</div>}
        onRejected={reason => <div>Error: {String(reason)}</div>}
        onResolved={content => (
          <>
            {content.meta && content.meta.pages > 1 && (
              <div id="pageButtons" class="text-center">
                <button onClick$={() => pageChange(content.meta.page > 1 ? pageNumber.value - 1 : 1)} class="inline-block p-0" title="Previous page" disabled={content.meta.page <= 1}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <title>Left arrow</title>
                    <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
                  </svg>
                </button>

                <div class="inline-block">
                  Page: {content.meta.page} / {content.meta.pages} - {content.meta.count} videos
                </div>

                <button onClick$={() => pageChange(content.meta.pages > content.meta.page ? pageNumber.value + 1 : content.meta.pages)} class="inline-block p-0" title="Next page" disabled={content.meta.pages <= content.meta.page}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <title>Right arrow</title>
                    <path d="M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z" />
                  </svg>
                </button>
              </div>
            )}

            {Array.isArray(content.data) && content.data[0] && (
              <div id="videos" class="gap grid grid-4 text-center">
                {content.data.map(video => (
                  <a key={video.id} class="block" href={video.video_url} aria-labelledby={`video-title-${video.id}`}>
                    <div class="video-image">
                      <img id={`video-image-${video.id}`} class="block h-full object-fit rounded w-full" src={video.video_image} alt={video.video_title} width="320" height="180" loading="lazy" aria-hidden="true" />
                    </div>

                    <div id={`video-title-${video.id}`} class="video-name">
                      {video.video_title}
                    </div>

                    <div class="video-info">
                      <span id={`video-created-${video.id}`}>{video.created}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      />
    </>
  )
})

export const head: DocumentHead = ({resolveValue, params}) => {
  const page = resolveValue(getPage)
  return {
    title: `Videos about ${page.name} and related topics`,
    meta: [
      {
        name: 'description',
        content: page.description
      }
    ]
  }
}
