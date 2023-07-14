<script setup lang="ts">
	import { page } from '$app/stores';
	import { religion, religions } from '$lib/store';
	import type { Religion } from '$lib/types';

	$: slug = $page.params.religion.replace(/([^a-z])/gi, '');
	$: if (!religion || $religion?.slug !== slug) {
		religion.set($religions.find((r: Religion) => r.slug === slug));
	}
</script>

{#if $religion?.id}
	<slot />
{/if}
