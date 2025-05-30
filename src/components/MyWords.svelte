<script>
	let { componentIndex = 0, maxComponents = 1 } = $props();
	import { fade } from 'svelte/transition';
	import { tallyScrabblePoints } from '$lib/utils.js';
	import { definitionWord, validWords } from '$lib/stores.js';
	import { selectDefinitionWord } from '$lib/definitions.js';

	let sortedValidWords = $derived([...$validWords].sort((a, b) => b.length - a.length));

	let thisComponentsWords = $derived(() => {
		let chunkSize = Math.floor(sortedValidWords.length / maxComponents);
		let start = chunkSize * componentIndex;
		let end =
			componentIndex === maxComponents - 1
				? sortedValidWords.length // include remaining words in the last chunk
				: chunkSize * (componentIndex + 1);
		return sortedValidWords.slice(start, end);
	});
</script>

<div
	in:fade={{ duration: 350 }}
	class="dark:border-text/10 border-text/30 bg-bg-secondary flex flex-col items-center justify-center gap-2 rounded-lg border p-4 shadow-lg md:p-6 md:text-lg"
>
	<div class="text-text/80 grid grid-cols-3 text-center">
		<span class="text-text/90 p-3 font-bold">Word</span>
		<span class="text-text/90 p-3 font-bold">Length</span>
		<span class="text-text/90 p-3 font-bold">Scrabble Points</span>
		{#each thisComponentsWords() as validWord}
			<div class="flex w-full items-center justify-center">
				<button
					onclick={() => {
						selectDefinitionWord(validWord);
					}}
					class="w-fit rounded-md p-1 {$definitionWord === validWord
						? 'bg-accent/40'
						: 'hover:bg-accent/30'} hover:text-text">{validWord}</button
				>
			</div>
			<span>{validWord.length}</span>
			<span>{tallyScrabblePoints(validWord.split(''))}</span>
		{/each}
	</div>
</div>
