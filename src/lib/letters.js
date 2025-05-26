import { shuffleArraySeeded } from './utils.js';

export const letterWeights = {
	A: 0.5, // Common vowel
	B: 0.2, // Less common consonant
	C: 0.3, // Moderate frequency
	D: 0.4, // Moderate frequency
	E: 0.9, // Most common vowel
	F: 0.2, // Less common consonant
	G: 0.2, // Less common consonant
	H: 0.3, // Moderate frequency
	I: 0.7, // Common vowel
	J: 0.1, // Rare consonant
	K: 0.1, // Rare consonant
	L: 0.4, // Moderate frequency
	M: 0.3, // Moderate frequency
	N: 0.5, // Common consonant
	O: 0.6, // Common vowel
	P: 0.3, // Moderate frequency
	Q: 0.05, // Very rare
	R: 0.5, // Common consonant
	S: 0.6, // Common consonant
	T: 0.7, // Common consonant
	U: 0.4, // Moderate vowel
	V: 0.1, // Rare consonant
	W: 0.2, // Less common consonant
	X: 0.05, // Very rare
	Y: 0.2, // Less common
	Z: 0.05 // Very rare
};

// Scrabble points
export const letterPoints = {
	A: 1,
	B: 3,
	C: 3,
	D: 2,
	E: 1,
	F: 4,
	G: 2,
	H: 4,
	I: 1,
	J: 8,
	K: 5,
	L: 1,
	M: 3,
	N: 1,
	O: 1,
	P: 3,
	Q: 10,
	R: 1,
	S: 1,
	T: 1,
	U: 1,
	V: 4,
	W: 4,
	X: 8,
	Y: 4,
	Z: 10
};

const vowels = 'AEIOU';
const maxDuplicates = 3; // RRR = 3
const maxDuplicateSets = 4; // How many sets of letters are duplicated e.g. RRSSTT would be 3

export function getLetters(count = 16, rng = Math.random) {
	const lettersArray = makeWeightedLettersArray();
	shuffleArraySeeded(lettersArray, rng);
	let res = [];
	let characterMapping = new Map();
	let vowelCount = 0;
	let duplicateSets = 0;

	const maxVowels = Math.ceil(count / 2);
	const minVowels = Math.ceil(count / 3);

	for (const char of lettersArray) {
		// Not too many duplicates
		const currentCharCount = characterMapping.get(char);
		const tooManyDuplicates = currentCharCount === maxDuplicates;

		// Not too many vowels
		const isAVowel = vowels.includes(char);
		const tooManyVowels = isAVowel && vowelCount === maxVowels;

		if (tooManyDuplicates || tooManyVowels) {
			continue;
		}

		isAVowel && vowelCount++;
		characterMapping.set(char, currentCharCount === undefined ? 1 : currentCharCount + 1);

		// Cheeky logic here. We're incrementing duplicateSets each time a character reaches a count of 2.
		if (currentCharCount === 1) {
			duplicateSets++;
		}

		if (duplicateSets > maxDuplicateSets) {
			return getLetters(count, rng);
		}

		// Make sure if we're adding a Q to add a U too.
		if (char === 'Q') {
			if (res.length + 1 === count) {
				continue;
			} else {
				lettersArray.splice(0, 0, 'U');
			}
		}

		res.push(char);

		if (res.length === count) break;
	}

	const notEnoughVowels = vowelCount < minVowels;
	const aQWithNoU = characterMapping.get('Q') > 0 && !characterMapping.get('U');

	if (notEnoughVowels || aQWithNoU) {
		return getLetters(count, rng);
	}

	return res;
}

function makeWeightedLettersArray() {
	const res = [];

	for (const key of Object.keys(letterWeights)) {
		const weight = letterWeights[key];
		const weightedMax = Math.max(Math.round(weight * 10), 1);
		for (let i = 0; i < weightedMax; i++) {
			res.push(key);
		}
	}

	return res;
}
