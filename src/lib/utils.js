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
