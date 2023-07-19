<script lang="ts">
	import { page } from '$app/stores';
	import { fetchData, hero, religion } from '$lib/store'
	import type { Page } from '$lib/types'
	import PageEdit from '$lib/PageEdit.svelte'

	$: slug = $page.params.religion.replace(/([^a-z])/gi, '');
	$: links = <Page[]|null>null

	const getLinks = async () => {
		links = await fetchData(`religions/${slug}/pages`)
	}

	$: if (slug) {
		getLinks()

		const pages = [
    	{name: String($religion?.name), url: `/${slug}`}
  	]

		$hero = {
			alt: `Religion: ${$religion?.name}`,
			image: String($religion?.slug),
			pages,
			title: `What is ${$religion?.name}?`
		}
	}
</script>

{#if $religion?.id}
		{@html $religion.content}

		<div id="content-links" class="mt-2">
			<h2 class="m-0">Read more about {$religion?.name}</h2>
			<ul class="list">
				<li><a class="inline-block text-primary" href={`/${$religion.slug}/videos`}>Videos about {$religion.name} and related topics</a></li>

				{#if Array.isArray(links)}
					{#each links as link}
						<li><a class="inline-block text-primary" href={`/${$religion.slug}/${link.slug}`}>{link.title}</a></li>
					{/each}
				{/if}
			</ul>
		</div>

	<PageEdit content={$religion.content} id={$religion.id} type="religions"/>
{/if}