<script>
	import { fade } from 'svelte/transition';
	import { letterPoints } from '$lib/letters.js';
	import { definitionWord, validWords } from '$lib/stores.js';
	import { selectDefinitionWord } from '$lib/definitions.js';

	function tallyScrabblePoints(charArray) {
		return charArray.reduce((acc, letter) => {
			const points = letterPoints[letter.toUpperCase()];
			return acc + points;
		}, 0);
	}

	let sortedValidWords = $derived([...$validWords].sort((a, b) => b.length - a.length));
</script>

<div
	in:fade={{ duration: 350 }}
	class="dark:border-text/10 border-text/30 bg-bg-secondary flex flex-col items-center justify-center gap-2 rounded-lg border p-4 shadow-lg md:p-6 md:text-lg"
>
	<div class="text-text/80 grid grid-cols-3 text-center">
		<span class="text-text/90 p-3 font-bold">Word</span>
		<span class="text-text/90 p-3 font-bold">Length</span>
		<span class="text-text/90 p-3 font-bold">Scrabble Points</span>
		{#each sortedValidWords as validWord}
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
