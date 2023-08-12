<script lang="ts">
  import {onMount} from 'svelte'
  import {religions} from '$lib/store'
  import type {Religion} from '$lib/types'

  let selectedReligion: Religion | null = null

  onMount(async () => {
    if (Array.isArray($religions)) {
      selectedReligion = $religions[0]
    }
  })

  const handleReligion = async () => {}
</script>

{#if Array.isArray($religions)}
  <select bind:value={selectedReligion}>
    {#each $religions as religion}
      <option value={religion}>{religion.name}</option>
    {/each}
  </select>
{/if}

{#if selectedReligion}
  <h1>{selectedReligion.name}</h1>

  <form on:submit|preventDefault={() => handleReligion()} class="gap-6 grid">
    <label>
      <span>Description (meta)</span>
      <textarea class="textarea textarea-bordered w-full">{selectedReligion?.description}</textarea>
    </label>

    <label>
      <span>Summary (list)</span>
      <textarea class="textarea textarea-bordered w-full">{selectedReligion?.summary}</textarea>
    </label>

    <label>
      <span>Content</span>
      <textarea class="textarea textarea-bordered w-full">{selectedReligion?.content}</textarea>
    </label>
  </form>
{/if}
