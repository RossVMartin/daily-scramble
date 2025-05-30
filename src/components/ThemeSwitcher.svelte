<script>
	import { darkMode, statsEnabled, allValidWords } from '$lib/stores.js';
	import DarkMode from '$icons/DarkMode.svelte';
	import LightMode from '$icons/LightMode.svelte';
	import Leaderboard from '$icons/Leaderboard.svelte';

	function handleSwitchTheme() {
		const root = document.documentElement;
		if (root.classList.contains('dark')) {
			root.classList.remove('dark');
		} else {
			root.classList.add('dark');
		}
		darkMode.set(!$darkMode);
	}

	function handleToggleStats() {
		statsEnabled.set(!$statsEnabled);
	}
</script>

<!-- Theme switcher mobile -->
<div class="mb-[-16px] flex w-full justify-end gap-2 md:hidden">
	{#if Object.keys($allValidWords).length}
		<button
			title="Toggle stats"
			onclick={handleToggleStats}
			class="text-text/80 {$statsEnabled
				? 'bg-accent/20 hover:bg-accent/40'
				: 'hover:bg-accent/30 bg-bg-secondary/50'}  border-bg-secondary top-2 right-2 rounded-lg border p-1.5 transition-all duration-150 md:absolute md:p-2"
		>
			<Leaderboard size={18} />
		</button>
	{/if}
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
<div class="absolute top-2 right-2 flex gap-2">
	{#if Object.keys($allValidWords).length}
		<button
			title="Toggle stats"
			onclick={handleToggleStats}
			class="text-text/80 {$statsEnabled
				? 'bg-accent/20 hover:bg-accent/40'
				: 'hover:bg-accent/30 bg-bg-secondary/50'} border-bg-secondary hidden rounded-lg border p-1.5 transition-all duration-150 md:block md:p-2"
		>
			{#if typeof document !== 'undefined' && $darkMode}
				<Leaderboard size={28} />
			{:else}
				<Leaderboard size={28} />
			{/if}
		</button>
	{/if}

	<button
		title="Change theme"
		onclick={handleSwitchTheme}
		class="text-text/80 bg-bg-secondary/50 hover:bg-accent/30 border-bg-secondary hidden rounded-lg border p-1.5 transition-all duration-150 md:block md:p-2"
	>
		{#if typeof document !== 'undefined' && $darkMode}
			<LightMode size={28} />
		{:else}
			<DarkMode size={28} />
		{/if}
	</button>
</div>
