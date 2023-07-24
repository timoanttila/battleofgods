<script lang="ts">
  import {onMount} from 'svelte'
  import {browser} from '$app/environment'
  import {fetchData, religions, user, width} from '$lib/store'
  import Header from '$lib/Header.svelte'
  import Hero from '$lib/Hero.svelte'
  import type {Religion} from '$lib/types'

  export let data: Religion[]
  religions.set(data)

  onMount(async () => {
    religions.set(await fetchData('religions'))
  })

  if (browser) {
    user.useLocalStorage()
  }
</script>

<svelte:window bind:innerWidth={$width} />

{#if Array.isArray($religions)}
  <div id="wrap" class="flex">
    <main class="block container mx-auto">
      <Header />
      <Hero />
      <div id="content" class="leading mt-1 px">
        <slot />
      </div>
    </main>

    <footer class="bg-blue block">
      <div class="container mx-auto px text-center">
        <p>
          <small>Created by <a class="text-dark" href="https://timoanttila.com/" title="Full Stack Web Developer Timo Anttila">Timo Anttila</a>, <a class="text-dark" href="https://tuspe.com/">Tuspe Design Oy</a></small><br />
          <small><a class="text-dark" href="/privacy" rel="nofollow" title="GDPR compliance statement">Data protection by design and by default</a></small>
        </p>
      </div>
    </footer>
  </div>
{/if}
