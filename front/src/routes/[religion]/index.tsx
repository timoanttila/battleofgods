import {component$, Resource, useResource$, useSignal, $} from '@builder.io/qwik'
import {routeLoader$, useLocation, DocumentHead} from '@builder.io/qwik-city'

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
  console.log('getPage ladattu')
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
          <div class="text-center">
            <h1>What is {data.name}?</h1>
            {data.description}
          </div>
        )}
      />

      <Resource
        value={videos}
        onPending={() => <div>Loading...</div>}
        onRejected={reason => <div>Error: {reason}</div>}
        onResolved={content => (
          <>
            {content.meta && (
              <div id="pageButtons" class="text-center">
                <button onClick$={() => pageChange(content.meta.page > 1 ? pageNumber.value - 1 : 1)}>Ed</button>
                <div>
                  {content.meta.page} / {content.meta.pages} - {content.meta.count}
                </div>
                <button onClick$={() => pageChange(content.meta.pages > content.meta.page ? pageNumber.value + 1 : content.meta.pages)}>Se</button>
              </div>
            )}

            {Array.isArray(content.data) && content.data[0] && (
              <div id="videos" class="text-center">
                {content.data.map(video => (
                  <a key={video.id} href={video.video_url} aria-labelledby={`video-title-${video.id}`}>
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
