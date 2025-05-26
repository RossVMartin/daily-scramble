<script>
	import seedrandom from 'seedrandom';
	import { getNowUTC } from '$lib/dateUtils.js';
	import { getLetters, letterPoints } from '$lib/letters.js';
	import { isValidWord, findLongestWord } from '$lib/dictionary.js';
	import { sleep } from '$lib/utils.js';
	import { slide, fly, fade, blur } from 'svelte/transition';
	import { onMount } from 'svelte';
	import DarkMode from '../icons/DarkMode.svelte';
	import LightMode from '../icons/LightMode.svelte';

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

	let definitionWord = $state(null);
	let definitions = {};

	let darkMode = $state(null);

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
		darkMode = document.documentElement.classList.contains('dark');
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
			console.log('keydown', invalidLetterStack.length);
			invalidLetterStack.length < 3 && invalidLetterStack.push(key);
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

	async function selectDefinitionWord(word, forceEnable = false) {
		if (!forceEnable && word === definitionWord) {
			definitionWord = null;
			return;
		}

		if (!definitions[word]) {
			try {
				const data = await fetchDefinition(word);
				if (!data || typeof data !== 'object' || data?.title === 'No Definitions Found') {
					throw new Error();
				}

				const definition = data[0]?.meanings[0]?.definitions[0]?.definition;

				if (!definition) {
					throw new Error();
				}

				definitions[word] = definition;
			} catch (err) {
				console.log('Error fetching definition', err);
				definitions[word] = null;
			}
		}
		definitionWord = word;
	}

	async function fetchDefinition(word) {
		const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
		if (!res.ok) {
			throw new Error('Word not found');
		}
		const data = await res.json();
		return data;
	}

	function handleSwitchTheme() {
		const root = document.documentElement;
		if (root.classList.contains('dark')) {
			root.classList.remove('dark');
		} else {
			root.classList.add('dark');
		}
		darkMode = !darkMode;
	}
</script>

{#if definitionWord !== null}
	<div
		class="bg-accent/60 dark:bg-accent/40 dark:md:hover:bg-accent/50 md:hover:bg-accent/70 fixed right-2 bottom-2 z-50 flex h-fit w-fit max-w-[320px] min-w-[180px] flex-col gap-2 rounded-lg p-3 shadow-lg backdrop-blur-xs transition-all duration-150 md:max-w-[400px] md:min-w-[225px] md:p-4 lg:top-5 lg:left-5"
	>
		<div class="relative w-full">
			<h2 class="text-text/90 text-lg font-bold md:text-2xl">{definitionWord}</h2>
			<button
				title="Close"
				onclick={() => {
					definitionWord = null;
				}}
				class="text-text/60 hover:text-text absolute top-0 right-0 text-lg font-bold">✕</button
			>
		</div>

		<span class="text-text/90 text-sm md:text-base"
			>{definitions[definitionWord] ?? 'No definition found'}</span
		>
		{#if definitions[definitionWord]}
			<div class="flex w-full justify-end">
				<a
					href={`https://en.wiktionary.org/wiki/${definitionWord}`}
					target="_blank"
					rel="noopener noreferrer"
					class="text-text/70 hover:text-text w-fit text-sm font-medium">Read More</a
				>
			</div>
		{/if}
	</div>
{/if}

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
		<!-- Theme switcher mobile -->
		<div class="mb-[-16px] flex w-full justify-end md:hidden">
			<button
				title="Change theme"
				onclick={handleSwitchTheme}
				class="text-text/80 bg-accent/10 hover:bg-accent/30 border-bg-secondary top-2 right-2 rounded-lg border p-1.5 transition-all duration-150 md:absolute md:p-2"
			>
				{#if typeof document !== 'undefined' && darkMode}
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
			class="text-text/80 bg-accent/10 hover:bg-accent/30 border-bg-secondary absolute top-2 right-2 hidden rounded-lg border p-1.5 transition-all duration-150 md:block md:p-2"
		>
			{#if typeof document !== 'undefined' && darkMode}
				<LightMode size={28} />
			{:else}
				<DarkMode size={28} />
			{/if}
		</button>

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
					class="fixed top-14 left-14 z-50 md:absolute md:top-[-100px] md:left-[-100px]"
				>
					<span
						class="stardos-stencil-regular bg-error/60 text-text/80 block rounded-xl p-4 text-3xl shadow-lg backdrop-blur-xl md:text-5xl"
						>{invalidLetter}</span
					>
				</div>
			{/if}
			<div class="grid grid-cols-9 justify-center">
				{#each letters as { letter, used }, index}
					{#if used}
						<span
							class="stardos-stencil-regular text-text/30 block w-full p-4 text-center text-3xl md:text-5xl"
							>{letter}</span
						>
					{:else}
						<button
							disabled={disableAllInputs}
							onclick={() => {
								addLetter(index);
							}}
							class="stardos-stencil-regular hover:bg-accent/30 rounded-lg p-4 text-3xl hover:shadow-lg md:text-5xl"
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
				class="bg-bg-secondary text-text border-text/30 rounded-lg border px-4 py-2 shadow-md dark:border-0 {checkAnswerButtonDisabled
					? 'text-text/50'
					: 'text-text/80 hover:text-text'}"
				onmouseenter={checkAnswerMouseEnter}
				onmouseleave={checkAnswerMouseLeave}
				onclick={checkAnswer}>Check Answer</button
			>

			<button
				disabled={wordTrie === null || disableAllInputs}
				onclick={handleFindLongestWord}
				class="bg-bg-secondary rounded-lg px-4 py-2 {wordTrie
					? 'text-text/80 hover:text-text'
					: 'text-text/50'} border-text/30 border shadow-md dark:border-0">Show Longest Word</button
			>

			<button
				disabled={disableAllInputs}
				onclick={clearCurrentWord}
				class="bg-bg-secondary text-text/80 hover:text-text border-text/30 rounded-lg border px-4 py-2 shadow-md dark:border-0"
				>Clear</button
			>
		</div>

		<!-- My words -->
		{#if validWords.length && !loading}
			<div
				in:fade={{ duration: 350 }}
				class="dark:border-text/10 border-text/30 bg-bg-secondary flex flex-col items-center justify-center gap-2 rounded-lg border p-4 shadow-lg md:p-6 md:text-lg"
			>
				<!-- <span class="fjalla-one-regular text-text text-lg md:mt-[-10px] md:mb-2 md:text-2xl"
					>My Words</span
				> -->

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
								class="w-fit rounded-md p-1 {definitionWord === validWord
									? 'bg-accent/40'
									: 'hover:bg-accent/30'} hover:text-text">{validWord}</button
							>
						</div>
						<span>{validWord.length}</span>
						<span>{tallyScrabblePoints(validWord.split(''))}</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Footer e.g flex-grow and made by Ross etc -->
		<div class="text-text/80 flex flex-grow items-end justify-end text-center text-xs md:text-sm">
			<div>
				New scrambles every day (UTC time). Words are validated with a <a
					class="hover:text-text underline"
					href="https://www.freescrabbledictionary.com/sowpods/"
				>
					European SOWPODS dictionary</a
				>.
			</div>
		</div>
	</div>
</div>
