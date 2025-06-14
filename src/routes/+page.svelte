<script>
	import seedrandom from 'seedrandom';
	import {
		word,
		wordAsString,
		letters,
		disableAllInputs,
		validWords,
		statsEnabled,
		debugEnabled,
		notifications,
		fetchingDefinition
	} from '$src/lib/stores';
	import { getNowUTC } from '$lib/dateUtils.js';
	import { getLetters, letterPoints } from '$lib/letters.js';
	import { isValidWord, findLongestWord, findRandomWord } from '$lib/wordTrie.js';
	import { debounce, shuffleArraySeeded, sleep } from '$lib/utils.js';
	import { slide, fly, fade, blur } from 'svelte/transition';
	import { onMount, tick } from 'svelte';
	import { selectDefinitionWord } from '$lib/definitions.js';

	import ThemeSwitcher from '$components/ThemeSwitcher.svelte';
	import Definition from '$components/Definition.svelte';
	import MyWords from '$components/MyWords.svelte';
	import LetterSelector from '$components/LetterSelector.svelte';
	import Buttons from '$components/Buttons.svelte';
	import MyStats from '$components/MyStats.svelte';
	import Notifications from '$components/Notifications.svelte';

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

	// const game = {
	// 	date: '',
	// 	buttons: {
	// 		// could be a custom store? or built into game hmm
	// 		checkAnswer: {
	// 			onclick: checkAnswer, // ?
	// 			label: 'Check Answer',
	// 			disabled // bool
	// 		},
	// 		// etc
	// 		areAllDisabled // bool
	// 	},
	// 	letters: {
	// 		// custom store of an array
	// 		shuffle // func
	// 	},
	// 	word: {
	// 		// custom store of an array
	// 		asString, // reactive str
	// 		write, // func
	// 		clear, // func
	// 		addLetter, // func
	// 		removeLetter, // func
	// 		isValid // reactive bool
	// 	},
	// 	notifications: {
	// 		// not sure need a custom store for this. could be built into game store
	// 		showIfValidWord, // bool
	// 		wordChecked, // str
	// 		showDictionaryWarning // bool
	// 	}
	// };

	let wordTrie = $state(null);
	let showDictionaryWarning = $state(false);

	let checkAnswerButton = $state(null);
	let checkAnswerButtonDisabled = $derived(
		$disableAllInputs || $wordAsString.length === 0 || wordTrie === null || $fetchingDefinition
	);

	let screenWidth = $state(0);

	const calculateWordComponentsCount = (validWords, screenWidth) => {
		const wordCount = validWords.length;
		if (!wordCount || screenWidth < 1024 || wordCount < 11) {
			return 1;
		}

		if (wordCount > 29 && screenWidth >= 1800) {
			return 3;
		}

		if (wordCount > 19 && screenWidth >= 1200) {
			return 2;
		}

		return 1;
	};

	let wordComponentsCount = $derived(calculateWordComponentsCount($validWords, screenWidth));
	const buttons = [
		{
			id: 'checkAnswer',
			label: 'Check Answer',
			onclick: checkAnswer,
			disabled: () => checkAnswerButtonDisabled,
			onmouseenter: () => {
				showDictionaryWarning = true;
			},
			onmouseleave: () => {
				showDictionaryWarning = false;
			}
		},
		{
			id: 'longestWord',
			label: 'Show Longest Word',
			onclick: handleFindLongestWord,
			disabled: () => wordTrie === null || $disableAllInputs
		},
		{
			id: 'randomWord',
			label: 'Reveal Random Word',
			onclick: revealRandomWord,
			disabled: () => wordTrie === null || $disableAllInputs
		},
		{
			id: 'shuffleLetters',
			label: 'Shuffle',
			onclick: shuffleLetters
		},
		{
			id: 'clearWord',
			label: 'Clear',
			onclick: word.clear
		}
	];

	const debugButtons = [
		{
			id: 'add',
			label: 'Add',
			onclick: () => {
				validWords.update((vw) => [...vw, 'Test' + Math.random().toString().slice(2, 6)]);
			},
			disabled: false
		},
		{
			id: 'remove',
			label: 'Remove',
			onclick: () => {
				validWords.update((vw) => vw.slice(1));
			},
			disabled: false
		}
	];

	$debugEnabled && buttons.push(...debugButtons);

	function checkAnswer() {
		if (!wordTrie) {
			console.log('Wordtrie is not initialised yet');
			return;
		}
		const isTheWordValid = isValidWord($wordAsString, wordTrie);
		const wordChecked = $wordAsString[0] + $wordAsString.slice(1).toLowerCase();
		const message = isTheWordValid
			? `'${wordChecked}' is a valid word!`
			: `'${wordChecked}' is not a valid word.`;

		notifications.add(message, isTheWordValid ? 'validWord' : 'invalidWord');

		if (isTheWordValid) {
			selectDefinitionWord(wordChecked, true);
			if (!$validWords.includes(wordChecked)) {
				validWords.update((vw) => [...vw, wordChecked]);
			}
		}
	}

	onMount(async () => {
		screenWidth = window.innerWidth;
		loading = false;
		const handleResize = () => {
			screenWidth = window.innerWidth;
		};

		const handleResizeDebounced = debounce(handleResize, 50);

		window.addEventListener('resize', handleResizeDebounced);

		// const res = await fetch('/wordTrieSowpods.json');
		const res = await fetch('/wordTrieWordnik.json');
		wordTrie = await res.json();

		return () => {
			window.removeEventListener('resize', handleResizeDebounced);
		};
	});

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
			$validWords, // Pass found words
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
			$validWords,
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

	<Notifications />

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

		<!-- Game Buttons -->
		<Buttons {buttons} />

		<!-- My words -->
		{#if $validWords.length && !loading}
			<div class="flex w-full items-start justify-center gap-4" in:fade={{ duration: 300 }}>
				{#each Array.from({ length: wordComponentsCount }) as item, index}
					<MyWords componentIndex={index} maxComponents={wordComponentsCount} />
				{/each}
			</div>
		{/if}

		{#if $validWords.length && !loading && $statsEnabled}
			<!-- My stats -->
			<MyStats />
		{/if}

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
