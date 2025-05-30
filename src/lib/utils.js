import { letterPoints } from './letters.js';

export function shuffleArraySeeded(array, rng = Math.random) {
	// Fisher-Yates shuffle algorithm
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}

	return array;
}

export async function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export function tallyScrabblePoints(charArray) {
	return charArray.reduce((acc, letter) => {
		const points = letterPoints[letter.toUpperCase()];
		return acc + points;
	}, 0);
}

export function debounce(func, delay) {
	let debounceTimer; // Timer shared across all calls to this debounced function
	return function () {
		const context = this; // Capture the context
		const args = arguments; // Capture any provided arguments
		clearTimeout(debounceTimer); // Clear any existing timer
		debounceTimer = setTimeout(() => {
			func.apply(context, args);
		}, delay);
	};
}
