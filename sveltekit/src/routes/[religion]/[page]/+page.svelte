<script lang="ts">
  import {religion} from '$lib/store'
  import Hero from '$lib/Hero.svelte'

  export let data: any
</script>

{#if $religion?.id && data?.title}
  <Hero
  alt={`Religion: ${$religion.name}`}
  image={$religion.slug}
  title={data.title}
  />

  <div id="about" class="leading mt-2 mx-auto px">{@html data.content}</div>
{/if}