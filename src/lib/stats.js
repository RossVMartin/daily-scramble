import { tallyScrabblePoints } from './utils';

export function totalScrabblePoints(words) {
	return words.reduce((sum, word) => sum + tallyScrabblePoints(word.split('')), 0);
}

export function getLongestWord(words) {
	if (words.length === 0) return 'None';
	const longest = words.reduce((a, b) => (a.length > b.length ? a : b));
	return `${longest} (${longest.length} letters)`;
}

export function getShortestWord(words) {
	if (words.length === 0) return 'None';
	const shortest = words.reduce((a, b) => (a.length < b.length ? a : b));
	return `${shortest} (${shortest.length} letters)`;
}

export function getHighestScoringWord(words) {
	if (words.length === 0) return 'None';
	const highest = words.reduce((a, b) => {
		const aPoints = tallyScrabblePoints(a.split(''));
		const bPoints = tallyScrabblePoints(b.split(''));
		return aPoints > bPoints ? a : b;
	});
	const points = tallyScrabblePoints(highest.split(''));
	return `${highest} (${points} points)`;
}

export function getAvgWordLength(words) {
	if (words.length === 0) return '0.0';
	const avg = words.reduce((sum, word) => sum + word.length, 0) / words.length;
	return avg.toFixed(1);
}

export function getAvgPointsPerWord(words) {
	if (words.length === 0) return '0.0';
	const totalPoints = totalScrabblePoints(words);
	const avg = totalPoints / words.length;
	return avg.toFixed(1);
}

export function getUniqueLetters(words) {
	if (words.length === 0) return 0;
	const letters = new Set(words.join('').split(''));
	return letters.size;
}

export function getVowelRatio(words) {
	if (words.length === 0) return '0%';
	const allLetters = words.join('').split('');
	const vowels = new Set(['A', 'E', 'I', 'O', 'U']);
	const vowelCount = allLetters.filter((letter) => vowels.has(letter.toUpperCase())).length;
	const ratio = (vowelCount / allLetters.length) * 100;
	return `${ratio.toFixed(1)}%`;
}

export function getConsonantRatio(words) {
	if (words.length === 0) return '0%';
	const allLetters = words.join('').split('');
	const vowels = new Set(['A', 'E', 'I', 'O', 'U']);
	const consonantCount = allLetters.filter((letter) => !vowels.has(letter.toUpperCase())).length;
	const ratio = (consonantCount / allLetters.length) * 100;
	return `${ratio.toFixed(1)}%`;
}

export function getMostUsedLetter(words) {
	if (words.length === 0) return 'N/A';
	const letterCounts = words
		.join('')
		.toUpperCase()
		.split('')
		.reduce((acc, letter) => {
			acc[letter] = (acc[letter] || 0) + 1;
			return acc;
		}, {});
	return Object.keys(letterCounts).reduce((a, b) => (letterCounts[a] > letterCounts[b] ? a : b));
}

export function getUniqueStartingLetters(words) {
	if (words.length === 0) return 0;
	const startingLetters = new Set(words.map((word) => word[0].toUpperCase()));
	return startingLetters.size;
}

export function getWordDiversity(words) {
	if (words.length === 0) return 0;
	const lengths = new Set(words.map((word) => word.length));
	return lengths.size;
}

export function getMostCommonLength(words) {
	if (words.length === 0) return 'N/A';
	const lengthCounts = words.reduce((acc, word) => {
		const len = word.length;
		acc[len] = (acc[len] || 0) + 1;
		return acc;
	}, {});
	const mostCommon = Object.keys(lengthCounts).reduce((a, b) =>
		lengthCounts[a] > lengthCounts[b] ? a : b
	);
	return `${mostCommon} letters`;
}

export function getFavoriteLetter(words) {
	if (words.length === 0) return 'N/A';
	const letterCounts = words.reduce((acc, word) => {
		const firstLetter = word[0].toUpperCase();
		acc[firstLetter] = (acc[firstLetter] || 0) + 1;
		return acc;
	}, {});
	return Object.keys(letterCounts).reduce((a, b) => (letterCounts[a] > letterCounts[b] ? a : b));
}
