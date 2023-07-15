<script lang="ts">
  import { onMount } from 'svelte';
  import {religion, topic, topics, fetchData} from '$lib/store'

  export let type: string = 'videos'

  onMount(async () => {
    if (!Array.isArray($topics)) {
      topics.set(await fetchData(`topics?religion=${$religion?.id}&type=${type}`))
    }
	});
</script>

{#if Array.isArray($topics) && $topics[0]}
  <div id="filters" class="mt-2 text-center">
    <div class="inline-block input">
      <label for="select-topic" class="block">Topics</label>
      <select bind:value={$topic} id="select-topic" class="bg-white block w-full">
        <option value={0}>No choice</option>
        {#each $topics as topic}
          <option value={topic.id}>{topic.name} ({topic.total})</option>
        {/each}
      </select>
    </div>
  </div>
{/if}