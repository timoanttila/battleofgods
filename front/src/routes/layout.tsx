import {component$, Slot, useStyles$} from '@builder.io/qwik'
import {routeLoader$} from '@builder.io/qwik-city'
import type {RequestHandler} from '@builder.io/qwik-city'

import Header from '~/components/header'

import styles from './styles.css?inline'

export const onGet: RequestHandler = async ({cacheControl}) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5
  })
}

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString()
  }
})

export default component$(() => {
  useStyles$(styles)
  return (
    <div id="wrap" class="flex">
      <Header />
      <main class="container mx-auto">
        <Slot />
      </main>
      <footer class="bg-primary block">
        <div class="container mx-auto no-underline text-center text-white">
          Created by{' '}
          <a class="text-white" href="https://timoanttila.com/">
            Timo Anttila
          </a>
          ,
          <a class="text-white" href="https://tuspe.com/">
            Tuspe Design Oy
          </a>
        </div>
      </footer>
    </div>
  )
})
