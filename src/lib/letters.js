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

export function getLetters(count = 16, rng = Math.random) {
	const lettersArray = makeWeightedLettersArray();
	shuffleArraySeeded(lettersArray, rng);
	return lettersArray.slice(0, count);
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
