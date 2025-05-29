<script>
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { cubicOut, elasticOut, backInOut } from 'svelte/easing';

	import { word, disableAllInputs, letters } from '$lib/stores.js';

	let letterInputIsInvalid = $state(false);
	let invalidLetter = $state(null);

	let invalidLetterStack = [];
	let processingInvalidLettersStack = false;

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	async function handleKeyDown(event) {
		if ($disableAllInputs) return;
		const key = event.key.toUpperCase();
		if (key.length === 1 && key >= 'A' && key <= 'Z') {
			for (let i = 0; i < $letters.length; i++)
				if (!$letters[i].used && $letters[i].letter === key) {
					word.addLetter(i);
					return;
				}
			// Letter wasn't inputted
			invalidLetterStack.length < 3 && invalidLetterStack.push(key);
			!processingInvalidLettersStack && showInvalidLetters();
		} else if (key === 'BACKSPACE' && $word.length > 0) {
			word.removeLetter($word.length - 1);
		} else if (key === 'ENTER') {
			document.getElementById('checkAnswer').click();
		} else if (key === 'ESCAPE') {
			word.clear();
		}
	}

	function showInvalidLetters() {
		if (processingInvalidLettersStack) return;
		processingInvalidLettersStack = true;

		function processNext() {
			if (invalidLetterStack.length === 0) {
				processingInvalidLettersStack = false;
				letterInputIsInvalid = false;
				return;
			}

			invalidLetter = invalidLetterStack.shift();
			letterInputIsInvalid = true;

			setTimeout(() => {
				letterInputIsInvalid = false;
				setTimeout(processNext, 75);
			}, 500);
		}

		processNext();
	}
</script>

<div class="relative">
	{#if letterInputIsInvalid}
		<div
			class:shake-twist={letterInputIsInvalid}
			class="fixed top-14 left-14 z-50 md:absolute md:top-[-100px] md:left-[-100px]"
		>
			<span
				class="stardos-stencil-regular bg-error/60 text-text/80 block rounded-xl p-4 text-3xl shadow-lg backdrop-blur-xl md:text-5xl"
				>{invalidLetter}</span
			>
		</div>
	{/if}
	<div class="grid grid-cols-9 justify-center">
		{#each $letters as { letter, used, id }, index (id)}
			<div animate:flip={{ duration: 500 + Math.round(Math.random() * 1000), easing: backInOut }}>
				{#if used}
					<span
						class="stardos-stencil-regular text-text/30 block w-full p-4 text-center text-3xl md:text-5xl"
						>{letter}</span
					>
				{:else}
					<button
						disabled={$disableAllInputs}
						onclick={() => {
							word.addLetter(index);
						}}
						class="stardos-stencil-regular hover:bg-accent/30 w-full rounded-lg p-4 text-center text-3xl hover:shadow-lg md:text-5xl"
						>{letter}</button
					>
				{/if}
			</div>
		{/each}
	</div>
</div>
