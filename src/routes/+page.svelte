<script>
	import seedrandom from 'seedrandom';
	import { getNowUTC } from '$lib/dateUtils.js';
	import { getLetters, letterPoints } from '$lib/letters.js';
	import { isValidWord, findLongestWord } from '$lib/dictionary.js';
	import { sleep } from '$lib/utils.js';
	import { slide, fly, fade, blur } from 'svelte/transition';
	import { onMount } from 'svelte';

	let loading = $state(true);

	const utcDate = getNowUTC();
	const rng = seedrandom(utcDate);

	const lettersCount = 18;
	const letters = $state(
		getLetters(lettersCount, rng).map((l) => {
			return {
				letter: l,
				used: false
			};
		})
	);

	let word = $state([]);
	let wordAsString = $derived(word.map((w) => w.letter).join(''));

	let showIfValidWord = $state(false);
	let isTheWordValid = $state(null);
	let wordChecked = $state(null);
	let validWords = $state([]);
	let sortedValidWords = $derived([...validWords].sort((a, b) => b.length - a.length));
	let wordTrie = $state(null);
	let showDictionaryWarning = $state(false);
	let checkAnswerButton = $state(null);
	let disableAllInputs = $state(false);
	let checkAnswerButtonDisabled = $derived(
		disableAllInputs || wordAsString.length === 0 || wordTrie === null || showIfValidWord
	);
	let letterInputIsInvalid = $state(false);
	let invalidLetter = $state(null);

	let invalidLetterStack = [];
	let processingInvalidLettersStack = false;

	function addLetter(index) {
		word.push({
			letter: letters[index].letter,
			index
		});
		letters[index].used = true;
	}

	function removeLetter(index) {
		const letterPoolIndex = word[index].index;
		letters[letterPoolIndex].used = false;
		word.splice(index, 1);
	}

	function checkAnswer() {
		if (!wordTrie) {
			console.log('Wordtrie is not initialised yet');
			return;
		}
		isTheWordValid = isValidWord(wordAsString, wordTrie);

		showIfValidWord = true;
		wordChecked = wordAsString[0] + wordAsString.slice(1).toLowerCase();

		if (isTheWordValid && !validWords.includes(wordChecked)) {
			validWords.push(wordChecked);
		}

		updateStorage();

		setTimeout(() => {
			showIfValidWord = false;
		}, 3000);
	}

	onMount(async () => {
		loading = false;
		validWords = loadStorage();

		window.addEventListener('keydown', handleKeyDown);

		const res = await fetch('/wordTrieSowpods.json');
		wordTrie = await res.json();

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	async function handleKeyDown(event) {
		if (disableAllInputs) return;
		const key = event.key.toUpperCase();
		if (key.length === 1 && key >= 'A' && key <= 'Z') {
			for (let i = 0; i < letters.length; i++)
				if (!letters[i].used && letters[i].letter === key) {
					addLetter(i);
					return;
				}
			// Letter wasn't inputted
			invalidLetterStack.push(key);
			!processingInvalidLettersStack && showInvalidLetters();
		} else if (key === 'BACKSPACE' && word.length > 0) {
			removeLetter(word.length - 1);
		} else if (key === 'ENTER' && checkAnswerButton) {
			checkAnswerButton.click();
		} else if (key === 'ESCAPE') {
			clearCurrentWord();
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
			[...letters].map((l) => l.letter),
			wordTrie
		);
		clearCurrentWord();
		writeWord(longestWord);
	}

	async function writeWord(wordToWrite) {
		disableAllInputs = true;

		for (const char of wordToWrite) {
			for (let i = 0; i < letters.length; i++) {
				if (letters[i].letter === char && !letters[i].used) {
					letters[i].used = true;
					word.push({ letter: char, index: i });
					await sleep(Math.round(Math.random() * 100) + 100);
					break;
				}
			}
		}

		disableAllInputs = false;
	}

	function tallyScrabblePoints(charArray) {
		return charArray.reduce((acc, letter) => {
			const points = letterPoints[letter.toUpperCase()];
			return acc + points;
		}, 0);
	}

	function clearCurrentWord() {
		word = [];
		letters.forEach((l) => (l.used = false));
	}
</script>

<div class="relative flex min-h-screen flex-col">
	{#if showDictionaryWarning && wordTrie === null}
		<div
			class="fixed left-5 top-5 flex flex-col items-center justify-center gap-1 rounded-md bg-amber-500/30 p-2 text-center text-base text-white"
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
			class="fixed right-2 top-5 z-50 text-white/90 shadow-md md:right-5 md:top-8"
			in:fade={{ duration: 500 }}
			out:fade={{ duration: 500 }}
		>
			{#if isTheWordValid}
				<span class="relative rounded-lg bg-green-800/90 p-3 text-lg md:p-4 md:text-2xl"
					>'{wordChecked}' is a valid word!</span
				>
			{:else}
				<span class="relative rounded-lg bg-red-800/90 p-3 text-lg md:p-4 md:text-2xl"
					>'{wordChecked}' is not a valid word.</span
				>
			{/if}
		</div>
	{/if}

	<div
		in:fade={{ duration: 100 }}
		class="roboto-400 flex min-h-screen w-full flex-col items-center gap-y-4 bg-neutral-900 p-4 text-white md:gap-y-10"
	>
		<!-- Title -->
		<h1
			class="stardos-stencil-bold rounded-lg border-0 border-white/50 p-4 text-4xl text-white/90 md:text-6xl"
		>
			Daily Scramble
		</h1>

		<p class="mt-[-20px] text-white/80 md:mt-[-40px] md:text-lg">
			Try to find the longest word! A new scramble daily.
		</p>

		<!-- Your word -->
		<div class="flex min-h-20 flex-wrap justify-center gap-2 rounded-md p-4">
			{#each word as { letter }, index}
				<button
					onclick={() => {
						removeLetter(index);
					}}
					class="stardos-stencil-regular text-3xl underline underline-offset-8 md:text-5xl"
					>{letter}</button
				>
			{/each}
		</div>

		<!-- Letters -->
		<div class="relative">
			{#if letterInputIsInvalid}
				<div
					in:fly={{ duration: 0 }}
					out:fly={{ duration: 0 }}
					class:shake-twist={letterInputIsInvalid}
					class="absolute left-[-100px] top-[-100px] z-50"
				>
					<span
						class="stardos-stencil-regular block rounded-xl bg-red-500/40 p-4 text-3xl text-red-100 shadow-lg backdrop-blur-xl md:text-5xl"
						>{invalidLetter}</span
					>
				</div>
			{/if}
			<div class="grid grid-cols-9 justify-center">
				{#each letters as { letter, used }, index}
					{#if used}
						<span
							class="stardos-stencil-regular block w-full p-4 text-center text-3xl text-white/30 md:text-5xl"
							>{letter}</span
						>
					{:else}
						<button
							disabled={disableAllInputs}
							onclick={() => {
								addLetter(index);
							}}
							class="stardos-stencil-regular rounded-lg p-4 text-3xl hover:bg-pink-600/30 hover:shadow-lg md:text-5xl"
							>{letter}</button
						>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Buttons -->
		<div class="flex w-full justify-center gap-4 text-sm md:text-xl">
			<button
				bind:this={checkAnswerButton}
				disabled={checkAnswerButtonDisabled}
				class:hover:text-white={!checkAnswerButtonDisabled}
				class:text-opacity-50={checkAnswerButtonDisabled}
				class:text-opacity-80={!checkAnswerButtonDisabled}
				class="rounded-lg bg-neutral-800/60 px-4 py-2 text-white shadow-md"
				onmouseenter={checkAnswerMouseEnter}
				onmouseleave={checkAnswerMouseLeave}
				onclick={checkAnswer}>Check Answer</button
			>

			<button
				disabled={wordTrie === null || disableAllInputs}
				onclick={handleFindLongestWord}
				class="rounded-lg bg-neutral-800/60 px-4 py-2 {wordTrie
					? 'text-white/80 hover:text-white'
					: 'text-white/50'} shadow-md">Show Longest Word</button
			>

			<button
				disabled={disableAllInputs}
				onclick={clearCurrentWord}
				class="rounded-lg bg-neutral-800/60 px-4 py-2 text-white/80 shadow-md hover:text-white"
				>Clear</button
			>
		</div>

		<!-- My words -->
		{#if validWords.length && !loading}
			<div
				in:fade={{ duration: 350 }}
				class="flex flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-neutral-800/30 p-8 shadow-lg md:text-lg"
			>
				<span class="fjalla-one-regular mb-2 mt-[-10px] text-lg text-white/90 md:text-2xl"
					>My Words</span
				>
				<div class="grid grid-cols-3 text-center text-white/80">
					<span class="p-3 font-bold text-white">Word</span>
					<span class="p-3 font-bold text-white">Length</span>
					<span class="p-3 font-bold text-white">Scrabble Points</span>
					{#each sortedValidWords as validWord}
						<span>{validWord}</span>
						<span>{validWord.length}</span>
						<span>{tallyScrabblePoints(validWord.split(''))}</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Footer e.g flex-grow and made by Ross etc -->
		<div class="flex-grow items-end justify-end text-center text-xs text-white/80 md:text-sm">
			New scrambles every day (UTC time). Words are validated with a&nbsp;<a
				class="underline hover:text-white"
				href="https://www.freescrabbledictionary.com/sowpods/"
			>
				European SOWPODS dictionary</a
			>.
		</div>
	</div>
</div>
