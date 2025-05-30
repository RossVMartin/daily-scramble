<script>
	import { fade, fly, blur } from 'svelte/transition';
	import { tallyScrabblePoints } from '$lib/utils.js';
	import { validWords, allValidWords } from '$lib/stores.js';
	import * as Stats from '$lib/stats.js';

	import ArrowBack from '$src/icons/ArrowBack.svelte';
	import ArrowForward from '$src/icons/ArrowForward.svelte';

	const allWords = $derived(Object.keys($allValidWords).flatMap((key) => $allValidWords[key]));

	const stats = $derived({
		Today: {
			totalWords: {
				label: 'Total Words',
				value: $validWords.length
			},
			totalPoints: {
				label: 'Total Points',
				value: Stats.totalScrabblePoints($validWords)
			},
			longestWord: {
				label: 'Longest Word',
				value: Stats.getLongestWord($validWords)
			},
			highestScoringWord: {
				label: 'Highest Scoring Word',
				value: Stats.getHighestScoringWord($validWords)
			},
			avgWordLength: {
				label: 'Average Word Length',
				value: Stats.getAvgWordLength($validWords)
			},
			avgPointsPerWord: {
				label: 'Average Points per Word',
				value: Stats.getAvgPointsPerWord($validWords)
			},
			// uniqueLetters: {
			// 	label: 'Unique Letters Used',
			// 	value: Stats.getUniqueLetters($validWords)
			// },
			vowelRatio: {
				label: 'Vowel Usage Ratio',
				value: Stats.getVowelRatio($validWords)
			},
			consonantRatio: {
				label: 'Consonant Usage Ratio',
				value: Stats.getConsonantRatio($validWords)
			},
			mostUsedLetter: {
				label: 'Most Used Letter',
				value: Stats.getMostUsedLetter($validWords)
			},
			// uniqueStartingLetters: {
			// 	label: 'Unique Starting Letters',
			// 	value: Stats.getUniqueStartingLetters($validWords)
			// },
			// wordDiversity: {
			// 	label: 'Word Length Variety',
			// 	value: Stats.getWordDiversity($validWords)
			// },
			mostCommonLength: {
				label: 'Most Common Word Length',
				value: Stats.getMostCommonLength($validWords)
			}
			// favoriteLetter: {
			// 	label: 'Favorite Letter',
			// 	value: Stats.getFavoriteLetter($validWords)
			// }
		},
		'All Time': {
			totalWords: {
				label: 'Total Words',
				value: allWords.length
			},
			totalPoints: {
				label: 'Total Points',
				value: Stats.totalScrabblePoints(allWords)
			},
			longestWord: {
				label: 'Longest Word Ever',
				value: Stats.getLongestWord(allWords)
			},
			highestScoringWord: {
				label: 'Highest Scoring Word Ever',
				value: Stats.getHighestScoringWord(allWords)
			},
			avgWordLength: {
				label: 'Average Word Length',
				value: Stats.getAvgWordLength(allWords)
			},
			avgPointsPerWord: {
				label: 'Average Points per Word',
				value: Stats.getAvgPointsPerWord(allWords)
			},
			// uniqueLetters: {
			// 	label: 'Unique Letters Used',
			// 	value: Stats.getUniqueLetters(allWords)
			// },
			vowelRatio: {
				label: 'Vowel Usage Ratio',
				value: Stats.getVowelRatio(allWords)
			},
			consonantRatio: {
				label: 'Consonant Usage Ratio',
				value: Stats.getConsonantRatio(allWords)
			},
			mostUsedLetter: {
				label: 'Most Used Letter',
				value: Stats.getMostUsedLetter(allWords)
			},
			// uniqueStartingLetters: {
			// 	label: 'Unique Starting Letters',
			// 	value: Stats.getUniqueStartingLetters(allWords)
			// },
			// wordDiversity: {
			// 	label: 'Word Length Variety',
			// 	value: Stats.getWordDiversity(allWords)
			// },
			mostCommonLength: {
				label: 'Most Common Word Length',
				value: Stats.getMostCommonLength(allWords)
			},
			// favoriteLetter: {
			// 	label: 'Favorite Letter',
			// 	value: Stats.getFavoriteLetter(allWords)
			// },
			daysPlayed: {
				label: 'Days Played',
				value: Object.keys($allValidWords).length
			}
		}
	});

	const categories = ['Today', 'All Time'];
	let index = $state(0);

	function navigate(forwards = true) {
		if (forwards) {
			index = Math.min(categories.length - 1, index + 1);
		} else {
			index = Math.max(0, index - 1);
		}
	}

	const hiddenIndex = $derived(index === 1 ? 0 : 1);
</script>

<!-- <h2 class="fjalla-one-regular text-text/90 mt-8 mb-[-15px] w-full text-center text-2xl md:text-3xl">
	My Stats
</h2> -->

<div
	transition:fade={{ duration: 350 }}
	class="dark:border-text/10 border-text/30 bg-bg-secondary relative flex w-fit items-center justify-between gap-2 rounded-xl border p-4 shadow-lg md:p-6 md:text-lg"
>
	<!-- Left Arrow -->
	<div class:invisible={index === 0} class="flex h-full w-fit items-center justify-center">
		<button
			onclick={() => navigate(false)}
			class="dark:hover:bg-accent/80 hover:text-text hover:bg-accent/60 text-text/80 flex items-center justify-center rounded-lg p-1 text-3xl hover:scale-110 hover:shadow-md"
		>
			<ArrowBack />
		</button>
	</div>

	<!-- Stats Content -->
	{#key index}
		<div class="flex flex-1 flex-col items-center justify-center p-2">
			<div>
				<h3 class="fjalla-one-regular mb-4 text-3xl font-bold">
					{categories[index]}
				</h3>
			</div>
			<div class="text-text/90 w-full space-y-1">
				{#each Object.entries(stats[categories[index]]) as [type, { label, value }]}
					<div
						class="hover:bg-accent/10 text-text flex items-center justify-between gap-10 rounded-lg p-1 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
					>
						<span class="text-sm font-medium md:text-base">{label}:</span>
						<span class="text-text/80 hover:text-text w-fit text-right text-sm md:text-base"
							>{value}</span
						>
					</div>
				{/each}
			</div>
		</div>
	{/key}

	<!-- Right Arrow -->
	<div
		class:invisible={index === categories.length - 1}
		class="hover:bg-accent/30 flex h-full w-fit items-center justify-center"
	>
		<button
			onclick={() => navigate(true)}
			class="dark:hover:bg-accent/80 hover:text-text hover:bg-accent/60 text-text/80 rounded-lg p-1 text-3xl hover:scale-110 hover:shadow-md"
		>
			<ArrowForward />
		</button>
	</div>
</div>
