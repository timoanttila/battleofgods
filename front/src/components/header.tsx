import {component$, Resource, useResource$, useSignal} from '@builder.io/qwik'
import {useLocation} from '@builder.io/qwik-city'

export default component$(() => {
  const religion = useSignal<string>('')
  const location = useLocation()

  if (location.params.religion) {
    religion.value = location.params.religion.replace(/([^a-z])/gi, '').toLowerCase()
  }

  const pages = useResource$(async () => {
    const resp = await fetch(`https://api.battleofgods.net/religions`)
    const json = await resp.json()
    if (Array.isArray(json)) {
      return json
    } else {
      console.log('Failed fetch')
    }
  })

  return (
    <>
      <header>
        <Resource
          value={pages}
          onPending={() => <div>Loading...</div>}
          onRejected={reason => <div>Error: {String(reason)}</div>}
          onResolved={data => (
            <>
              {Array.isArray(data) && (
                <nav>
                  <ul id="navigation">
                    {data.map(page => (
                      <a key={page.id} href={`/${page.slug}/`}>
                        {page.name}
                      </a>
                    ))}
                  </ul>
                </nav>
              )}
            </>
          )}
        />
      </header>
    </>
  )
})
