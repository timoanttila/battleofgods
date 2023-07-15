<script lang="ts">
	import {religion} from '$lib/store'
	import Hero from '$lib/Hero.svelte'

  const pages = [
    {name: String($religion?.name), url: `/${$religion?.slug}`}
  ]
</script>

{#if $religion?.id}
	<Hero
		alt={`Religion: ${$religion.name}`}
		image={$religion.slug}
		{pages}
		title={`What is ${$religion.name}?`}
	/>

	<div id="content" class="leading mt-1 px">
		{@html $religion.content}

		<div id="content-links" class="mt-2">
			<a class="inline-block text-primary" href={`/${$religion.slug}/videos`}>Videos about {$religion.name} and related topics &rarr;</a>
		</div>
	</div>
{/if}