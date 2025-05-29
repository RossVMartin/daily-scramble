<script>
	import seedrandom from 'seedrandom';
	import { word, wordAsString, letters, disableAllInputs } from '$src/lib/stores';
	import { getNowUTC } from '$lib/dateUtils.js';
	import { getLetters, letterPoints } from '$lib/letters.js';
	import { isValidWord, findLongestWord, findRandomWord } from '$lib/wordTrie.js';
	import { shuffleArraySeeded, sleep } from '$lib/utils.js';
	import { slide, fly, fade, blur } from 'svelte/transition';
	import { onMount, tick } from 'svelte';
	import { selectDefinitionWord } from '$lib/definitions.js';

	import ThemeSwitcher from '$components/ThemeSwitcher.svelte';
	import Definition from '$components/Definition.svelte';
	import MyWords from '$components/MyWords.svelte';
	import LetterSelector from '$components/LetterSelector.svelte';

	let loading = $state(true);

	const utcDate = getNowUTC();
	const rng = seedrandom(utcDate);

	const lettersCount = 18;
	letters.set(
		getLetters(lettersCount, rng).map((letter, index) => {
			return {
				letter,
				used: false,
				id: index
			};
		})
	);

	let showIfValidWord = $state(false);
	let isTheWordValid = $state(null);
	let wordChecked = $state(null);
	let validWords = $state([]);
	let wordTrie = $state(null);
	let showDictionaryWarning = $state(false);

	let checkAnswerButton = $state(null);
	let checkAnswerButtonDisabled = $derived(
		$disableAllInputs || $wordAsString.length === 0 || wordTrie === null || showIfValidWord
	);

	function checkAnswer() {
		if (!wordTrie) {
			console.log('Wordtrie is not initialised yet');
			return;
		}
		isTheWordValid = isValidWord($wordAsString, wordTrie);

		showIfValidWord = true;
		wordChecked = $wordAsString[0] + $wordAsString.slice(1).toLowerCase();

		if (isTheWordValid) {
			selectDefinitionWord(wordChecked, true);
			!validWords.includes(wordChecked) && validWords.push(wordChecked);
		}

		updateStorage();

		setTimeout(() => {
			showIfValidWord = false;
		}, 3000);
	}

	onMount(async () => {
		loading = false;
		validWords = loadStorage();

		// const res = await fetch('/wordTrieSowpods.json');
		const res = await fetch('/wordTrieWordnik.json');
		wordTrie = await res.json();
	});

	function loadStorage() {
		const storageStr = localStorage.getItem('dailyScrambleWords');
		const emptyStorage = { [utcDate]: [] };

		try {
			const parsedStorage = JSON.parse(storageStr);

			if (!parsedStorage || typeof parsedStorage !== 'object') {
				localStorage.setItem('dailyScrambleWords', JSON.stringify(emptyStorage));
				validWords = [];
				return [];
			}

			if (parsedStorage[utcDate] && Array.isArray(parsedStorage[utcDate])) {
				return parsedStorage[utcDate];
			} else {
				parsedStorage[utcDate] = [];
				localStorage.setItem('dailyScrambleWords', JSON.stringify(parsedStorage));
				validWords = [];
				return [];
			}
		} catch (err) {
			localStorage.setItem('dailyScrambleWords', JSON.stringify(emptyStorage));
			validWords = [];
			return [];
		}
	}

	function updateStorage() {
		const existingWords = loadStorage();
		const newWords = Array.from(new Set([...existingWords, ...validWords]));
		const parsedStorage = JSON.parse(localStorage.getItem('dailyScrambleWords'));
		parsedStorage[utcDate] = newWords;
		localStorage.setItem('dailyScrambleWords', JSON.stringify(parsedStorage));
		validWords = newWords;
	}

	function checkAnswerMouseEnter() {
		showDictionaryWarning = true;
	}

	function checkAnswerMouseLeave() {
		showDictionaryWarning = false;
	}

	function handleFindLongestWord() {
		const longestWord = findLongestWord(
			[...$letters].map((l) => l.letter),
			wordTrie
		);
		word.clear();
		word.write(longestWord);
	}

	async function revealRandomWord() {
		const letterSet = $letters.map((l) => l.letter);
		const foundWord = findRandomWord(
			letterSet,
			wordTrie,
			validWords, // Pass found words
			4, // minLength
			9, // maxLength (won't reveal 10+ letter words)
			0.7, // lengthPreference
			false // returnMultiple
		);
		if (foundWord) {
			word.clear();
			word.write(foundWord);
		}
	}

	async function revealMultipleRandomWords() {
		const letterSet = $letters.map((l) => l.letter);
		const words = findRandomWord(
			letterSet,
			wordTrie,
			validWords,
			4,
			0.7,
			true, // returnMultiple
			3 // maxResults
		);
		console.log(words);
	}

	async function shuffleLetters() {
		const iterations = Math.floor(Math.random() * 2) + 1;
		for (let i = 0; i < iterations; i++) {
			letters.set(shuffleArraySeeded($letters));
			await tick();
			await sleep(Math.floor(Math.random() * 100) + 50);
		}
	}
</script>

<Definition />

<div class="relative flex min-h-screen flex-col">
	{#if showDictionaryWarning && wordTrie === null}
		<div
			class="bg-warning/30 text-text fixed top-5 left-5 flex flex-col items-center justify-center gap-1 rounded-md p-2 text-center text-base"
			out:blur={{ duration: 200 }}
			in:fade={{ duration: 200 }}
		>
			<span>Dictionary is loading...</span><span
				>'Check Answer' won't work until it has loaded.</span
			>
		</div>
	{/if}

	{#if showIfValidWord}
		<div
			class="text-text/90 fixed top-5 right-2 z-50 shadow-md md:top-8 md:right-5"
			in:fade={{ duration: 500 }}
			out:fade={{ duration: 500 }}
		>
			{#if isTheWordValid}
				<span class="bg-success/90 text-text relative rounded-lg p-3 text-lg md:p-4 md:text-2xl"
					>'{wordChecked}' is a valid word!</span
				>
			{:else}
				<span class="bg-error/90 text-text relative rounded-lg p-3 text-lg md:p-4 md:text-2xl"
					>'{wordChecked}' is not a valid word.</span
				>
			{/if}
		</div>
	{/if}

	<div
		in:fade={{ duration: 100 }}
		class="roboto-400 bg-bg text-text flex min-h-screen w-full flex-col items-center gap-y-4 p-4 md:gap-y-10"
	>
		<ThemeSwitcher />

		<!-- Title -->
		<div class="flex flex-col items-center justify-center">
			<h1
				class="stardos-stencil-bold text-text/90 2xs:text-5xl xs:text-6xl rounded-lg p-4 text-4xl"
			>
				Daily Scramble
			</h1>

			<p class="text-text/80 xs:text-base mt-[-5px] text-sm md:text-lg">
				Try to find the longest word! A new scramble daily.
			</p>
		</div>

		<!-- Your word -->
		<div class="flex min-h-20 flex-wrap justify-center gap-2 rounded-md p-4">
			{#each $word as { letter }, index}
				<button
					onclick={() => {
						word.removeLetter(index);
					}}
					class="stardos-stencil-regular text-3xl underline underline-offset-8 md:text-5xl"
					>{letter}</button
				>
			{/each}
		</div>

		<!-- Letters -->
		<LetterSelector {checkAnswerButton} />

		<!-- Buttons -->
		<div class="flex w-full flex-wrap justify-center gap-4 text-sm md:text-xl">
			<button
				bind:this={checkAnswerButton}
				disabled={checkAnswerButtonDisabled}
				class="bg-bg-secondary text-text border-text/30 rounded-lg border px-4 py-2 shadow-md dark:border-0 {checkAnswerButtonDisabled
					? 'text-text/50'
					: 'text-text/80 hover:text-text'}"
				onmouseenter={checkAnswerMouseEnter}
				onmouseleave={checkAnswerMouseLeave}
				onclick={checkAnswer}>Check Answer</button
			>

			<button
				disabled={wordTrie === null || $disableAllInputs}
				onclick={handleFindLongestWord}
				class="bg-bg-secondary rounded-lg px-4 py-2 {wordTrie
					? 'text-text/80 hover:text-text'
					: 'text-text/50'} border-text/30 border shadow-md dark:border-0">Show Longest Word</button
			>

			<button
				disabled={wordTrie === null || $disableAllInputs}
				onclick={revealRandomWord}
				class="bg-bg-secondary rounded-lg px-4 py-2 {wordTrie
					? 'text-text/80 hover:text-text'
					: 'text-text/50'} border-text/30 border shadow-md dark:border-0"
				>Reveal Random Word</button
			>

			<button
				disabled={$disableAllInputs}
				onclick={shuffleLetters}
				class="bg-bg-secondary rounded-lg px-4 py-2 {disableAllInputs
					? 'text-text/80 hover:text-text'
					: 'text-text/50'} border-text/30 border shadow-md dark:border-0">Shuffle</button
			>

			<button
				disabled={$disableAllInputs}
				onclick={() => {
					word.clear();
				}}
				class="bg-bg-secondary text-text/80 hover:text-text border-text/30 rounded-lg border px-4 py-2 shadow-md dark:border-0"
				>Clear</button
			>
		</div>

		<!-- My words -->
		{#if validWords.length && !loading}
			<MyWords {validWords} />
		{/if}

		<!-- My stats -->

		<!-- Footer e.g flex-grow and made by Ross etc -->
		<div class="text-text/80 flex flex-grow items-end justify-end text-center text-xs md:text-sm">
			<!-- <div>
				New scrambles every day (UTC time). Words are validated with a <a
					class="underline hover:text-text"
					href="https://www.freescrabbledictionary.com/sowpods/"
				>
					European SOWPODS dictionary</a
				>.
			</div> -->
			New scrambles every day (UTC time). Source code on&nbsp;<a
				href="https://github.com/RossVMartin/daily-scramble"
				class="hover:text-text underline">GitHub</a
			>.
		</div>
	</div>
</div>
