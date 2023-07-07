import {component$, Resource, useResource$} from '@builder.io/qwik'
import type {DocumentHead} from '@builder.io/qwik-city'

import Videos from '~/components/videos'

interface SortData {
  id: number
  name: string
}

interface Filters {
  [key: string]: SortData[] | undefined
}

export default component$(() => {
  const filterValues = useResource$<Filters>(async () => {
    const filters: Filters = {religions: [], topics: []}
    for (const filter in filters) {
      filters[filter] = await getValues(filter)
    }

    return filters
  })

  return (
    <>
      <header>
        <Resource
          value={filterValues}
          onPending={() => <div>Loading...</div>}
          onRejected={reason => <div>Error: {reason}</div>}
          onResolved={data => (
            <div id="filters">
              {Array.isArray(data.religions) && (
                <select>
                  {data.religions.map(e => (
                    <option key={e.id}>{e.name}</option>
                  ))}
                </select>
              )}
              {Array.isArray(data.topics) && (
                <select>
                  {data.topics.map(e => (
                    <option key={e.id}>{e.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        />
      </header>
    </>
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

export async function getValues(sort: string): Promise<SortData[] | undefined> {
  const resp = await fetch(`https://api.battleofgods.net/${sort}`)
  const json = await resp.json()
  if (Array.isArray(json)) {
    return json
  } else {
    console.log('Failed fetch: ' + sort)
  }
}
