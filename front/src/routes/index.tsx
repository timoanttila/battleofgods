import {component$, Resource, useResource$, useSignal, $, useTask$} from '@builder.io/qwik'
import {routeLoader$, useLocation, DocumentHead} from '@builder.io/qwik-city'
import Hero from '../components/hero'

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
const description = `There are many religions in the world, so how can we know which religion is the right one and which one is meant for you? Battle of Gods provides an opportunity to explore the world's largest religions and watch videos from priests and ordinary people. Join us to discover the wonders, historical truths, and theology of religions.`

export default component$(() => {
  const religions = useResource$(async () => {
    const resp = await fetch(`${host}religions`)
    return await resp.json()
  })

  return (
    <>
      <Hero title="Battle of Gods" image="battle-of-gods" alt="A monk sits atop a large rock, looking out at the majestic castle in the distance. The sky is filled with white clouds and a flock of birds flying by." />

      <div id="about" class="text-center">
        {description}
      </div>

      <Resource
        value={religions}
        onPending={() => <div>Loading...</div>}
        onRejected={reason => <div>Error: {String(reason)}</div>}
        onResolved={data => (
          <div id="religions" class="gap grid no-underline">
            {data.map((religion: any) => (
              <div key={religion.id} class="gap grid grid-2">
                <div class="religion-image">
                  <img class="block h-full object-cover w-full" src={`/images/${religion.slug}-1350.webp`} alt="" />
                </div>

                <div class="align-center flex">
                  <div>
                    <h2 class="m-0">{religion.name}</h2>
                    <div class="religion-summary">{religion.summary}</div>
                    <div>
                      <a class="btn rounded" href={`/${religion.slug}/`} title={`What is religion ${religion.name}?`}>
                        Read more
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      />
    </>
  )
})

export const head: DocumentHead = ({resolveValue, params}) => {
  return {
    title: 'Battle of Gods',
    meta: [
      {
        name: 'description',
        content: description
      }
    ]
  }
}
