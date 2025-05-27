import { browser } from '$app/environment';
import { letters, disableAllInputs } from './stores.js';
import { writable, derived, get } from 'svelte/store';
import { sleep } from './utils.js';

export function localStorageStore(key, initialValue) {
	if (!browser) {
		// If SSR, return a writable store with initialValue but no localStorage access
		return writable(initialValue);
	}

	// Get from localStorage or use initialValue
	const storedValue = localStorage.getItem(key);
	const parsed = storedValue ? JSON.parse(storedValue) : initialValue;

	const { subscribe, set, update } = writable(parsed);

	// Update localStorage whenever store changes
	subscribe((value) => {
		localStorage.setItem(key, JSON.stringify(value));
	});

	return {
		subscribe,
		set,
		update,
		clear: () => {
			localStorage.removeItem(key);
			set(initialValue);
		}
	};
}

export function createWordStore() {
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

export function derivedWritable(parentStore, key, initialValue = []) {
	const { subscribe } = derived(
		parentStore,
		($parent, set) => {
			set($parent[key] ?? initialValue);
		},
		initialValue
	);

	return {
		subscribe,
		set: (newValue) => {
			parentStore.update((parent) => ({
				...parent,
				[key]: newValue
			}));
		},
		update: (fn) => {
			parentStore.update((parent) => {
				const currentValue = parent[key] ?? initialValue;
				const updatedValue = fn(currentValue);
				return {
					...parent,
					[key]: updatedValue
				};
			});
		}
	};
}
