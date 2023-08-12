<script lang="ts">
  import {onMount} from 'svelte'
  import {menu, religions, topics} from '$lib/store'
  import '$lib/app.css'

  export let data

  onMount(async () => {
    $religions = data.religions
    $topics = data.topics
  })
</script>

<header>
  {#each menu as page}
    <a class="btn btn-primary" href={page.link}>{page.title}</a>
  {/each}
</header>

{#if Array.isArray($religions)}
  <main class="grow max-w-screen-xl mx-auto">
    <slot />
  </main>
{/if}
