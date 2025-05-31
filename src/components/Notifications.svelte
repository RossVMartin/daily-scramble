<script>
	import { notifications } from '$src/lib/stores';
	import { fade, fly } from 'svelte/transition';

	const css = {
		invalidWord: 'bg-error/90',
		validWord: 'bg-success/90'
	};
</script>

<div class="text-text/90 fixed top-3 right-3 z-50 flex flex-col gap-3 md:top-4 md:right-4 md:gap-4">
	{#each $notifications as { message, type }}
		<span
			in:fly={{ x: 200, duration: 300 }}
			out:fly={{ x: 200, duration: 500 }}
			class="{css[type] ?? ''} text-text relative rounded-lg p-3 text-lg md:p-4 md:text-2xl"
			>{message}</span
		>
	{/each}
</div>
