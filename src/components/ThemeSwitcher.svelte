<script>
	import { darkMode } from '$lib/stores.js';
	import { onMount } from 'svelte';

	import DarkMode from '$icons/DarkMode.svelte';
	import LightMode from '$icons/LightMode.svelte';

	onMount(() => {
		darkMode.set(document.documentElement.classList.contains('dark'));
	});

	function handleSwitchTheme() {
		const root = document.documentElement;
		if (root.classList.contains('dark')) {
			root.classList.remove('dark');
		} else {
			root.classList.add('dark');
		}
		darkMode.set(!$darkMode);
	}
</script>

<!-- Theme switcher mobile -->
<div class="mb-[-16px] flex w-full justify-end md:hidden">
	<button
		title="Change theme"
		onclick={handleSwitchTheme}
		class="text-text/80 bg-bg-secondary/50 hover:bg-accent/30 border-bg-secondary top-2 right-2 rounded-lg border p-1.5 transition-all duration-150 md:absolute md:p-2"
	>
		{#if typeof document !== 'undefined' && $darkMode}
			<LightMode size={18} />
		{:else}
			<DarkMode size={18} />
		{/if}
	</button>
</div>

<!-- Theme switcher md -->
<button
	title="Change theme"
	onclick={handleSwitchTheme}
	class="text-text/80 bg-bg-secondary/50 hover:bg-accent/30 border-bg-secondary absolute top-2 right-2 hidden rounded-lg border p-1.5 transition-all duration-150 md:block md:p-2"
>
	{#if typeof document !== 'undefined' && $darkMode}
		<LightMode size={28} />
	{:else}
		<DarkMode size={28} />
	{/if}
</button>
