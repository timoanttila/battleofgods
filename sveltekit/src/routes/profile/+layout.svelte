<script lang="ts">
  import { goto } from '$app/navigation';
	import { user } from '$lib/store';

	$: if (!$user?.sub) {
  	goto('/profile/login')
  }
</script>

<svelte:head>
	<meta name="robots" content="noindex,nofollow"/>
</svelte:head>

<slot/>