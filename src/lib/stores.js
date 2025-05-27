import { derived, writable, get } from 'svelte/store';
import { sleep } from './utils.js';

export const darkMode = writable(null);
export const definitionWord = writable(null);
export const definitions = writable({});

export const definition = derived(
	[definitionWord, definitions],
	([$definitionWord, $definitions], set) => {
		set($definitions[$definitionWord]);
	}
);

export const disableAllInputs = writable(false);
export const letters = writable([]);

function createWordStore() {
	const { subscribe, set, update } = writable([]);

	return {
		subscribe,

		async write(wordToWrite) {
			disableAllInputs.set(true);
			const $letters = get(letters);
			let newWord = [];

			for (const char of wordToWrite) {
				for (let i = 0; i < $letters.length; i++) {
					if ($letters[i].letter === char && !$letters[i].used) {
						letters.update((l) => {
							l[i].used = true;
							return l;
						});
						newWord.push({ letter: char, index: i });
						set(newWord);
						await sleep(Math.round(Math.random() * 100) + 100);
						break;
					}
				}
			}
			disableAllInputs.set(false);
		},

		clear() {
			set([]);
			letters.update((l) => {
				l.forEach((letter) => (letter.used = false));
				return l;
			});
		},

		addLetter(poolIndex) {
			const $letters = get(letters);
			const letterObj = $letters[poolIndex];

			update((w) => [...w, { letter: letterObj.letter, index: poolIndex }]);
			letters.update((l) => {
				l[poolIndex].used = true;
				return l;
			});
		},

		removeLetter(wordIndex) {
			update((w) => {
				const letterPoolIndex = w[wordIndex].index;
				letters.update((l) => {
					l[letterPoolIndex].used = false;
					return l;
				});
				w.splice(wordIndex, 1);
				return w;
			});
		}
	};
}

export const word = createWordStore();
export const wordAsString = derived(word, ($word) => $word.map((w) => w.letter).join(''));
