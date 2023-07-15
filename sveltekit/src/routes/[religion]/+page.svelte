<script lang="ts">
	import { page } from '$app/stores';
	import { fetchData, religion } from '$lib/store'
	import type { Page } from '$lib/types'
	import Hero from '$lib/Hero.svelte'

	$: slug = $page.params.religion.replace(/([^a-z])/gi, '');
	$: links = <Page[]|null>null

	const getLinks = async () => {
		links = await fetchData(`pages?religion=${slug}`)
	}

	$: if (slug) {
		getLinks()
	}

  $: pages = [
    {name: String($religion?.name), url: `/${slug}`}
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
			<h2 class="m-0">Read more about {$religion?.name}</h2>
			<ul class="m-0">
				<li><a class="inline-block text-primary" href={`/${$religion.slug}/videos`}>Videos about {$religion.name} and related topics</a></li>

				{#if Array.isArray(links)}
					{#each links as link}
						<li><a class="inline-block text-primary" href={`/${$religion.slug}/${link.slug}`}>{link.title}</a></li>
					{/each}
				{/if}
			</ul>
		</div>
	</div>
{/if}