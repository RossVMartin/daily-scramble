<script>
	let { buttons } = $props();
	import { disableAllInputs } from '$lib/stores.js';

	const funcOrValue = (val) => (typeof val === 'function' ? val() : val);

	function flashMe(
		event,
		currentBgClass = 'hover:bg-bg-secondary-soft/30',
		flashBgClass = 'bg-bg-secondary-soft/40',
		ms = 75
	) {
		const element = event.currentTarget;
		element.classList.remove(currentBgClass);
		element.classList.add(flashBgClass);
		setTimeout(() => {
			element.classList.remove(flashBgClass);
			element.classList.add(currentBgClass);
		}, ms);
	}
</script>

<div class="flex flex-wrap justify-center w-full gap-4 text-sm md:text-xl">
	{#each buttons as { onclick, label, disabled = $disableAllInputs, id, onmouseenter = () => {}, onmouseleave = () => {} }}
		<button
			{id}
			disabled={funcOrValue(disabled)}
			onclick={(event) => {
				setTimeout(() => {
					onclick(event);
				}, 0);
				flashMe(event);
			}}
			{onmouseenter}
			{onmouseleave}
			class="bg-bg-secondary rounded-lg px-4 py-2 {!funcOrValue(disabled)
				? 'text-text/80 hover:text-text'
				: 'text-text/50'} border-text/30 hover:bg-bg-secondary-soft/30 border shadow-md dark:border-0"
			>{label}</button
		>
	{/each}
</div>
