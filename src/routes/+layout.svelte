<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { AppBar, AppShell, Toast, toastStore } from '@skeletonlabs/skeleton';
	import playerStore, { defaultPlayerStore } from '$lib/playerStore';
	import { page } from '$app/stores';

	if ($page.url.searchParams.has('setup')) {
		try {
			let raw = atob($page.url.searchParams.get('setup') ?? '');
			let decoded = JSON.parse(raw);
			console.log(decoded);
			$playerStore = decoded;
		} catch (e) {
			toastStore.trigger({
				message: 'Invalid Setup'
			});
			console.log('Invalid Search Params');
		}
	}
	console.log($page.url.searchParams);
</script>

<AppShell>
	<AppBar>
		<svelte:fragment slot="lead">Aethereus BGM Player</svelte:fragment>
		<svelte:fragment slot="trail" />
	</AppBar>
	<slot />
	<Toast />
</AppShell>
