<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { fetchData, religions, user, width } from '$lib/store';
	import type {Religion} from '$lib/types'
	import Header from '$lib/Header.svelte'

	export let data: Religion[];
	religions.set(data)

	onMount(async () => {
		religions.set(await fetchData('religions'))
	});

	if (browser) {
		user.useLocalStorage();
	}
</script>

<svelte:window bind:innerWidth={$width} />

{#if Array.isArray($religions)}
<div id="wrap" class="flex">
	<main class="block container mx-auto">
		<Header/>
		<slot />
	</main>

	<footer class="bg-primary block">
		<div class="container mx-auto text-center text-white">
			Created by <a class="no-underline text-white" href="https://timoanttila.com/">Timo Anttila</a>, <a class="no-underline text-white" href="https://tuspe.com/">Tuspe Design Oy</a>
		</div>
	</footer>
</div>

	{#if browser}
		<SvelteToast />
	{/if}
{/if}

<style type="text/scss">
	@import "../global.scss";
</style>
