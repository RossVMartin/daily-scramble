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
						letters.update(($letters) => {
							$letters[i].used = true;
							return $letters;
						});
						newWord.push({ letter: char, id: $letters[i].id });
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
			letters.update(($letters) => {
				$letters.forEach((letter) => (letter.used = false));
				return $letters;
			});
		},

		addLetter(poolIndex) {
			const $letters = get(letters);
			const { letter, id } = $letters[poolIndex];
			update(($word) => [...$word, { letter, id }]);
			letters.update(($letters) => {
				$letters[poolIndex].used = true;
				return $letters;
			});
		},

		removeLetter(wordIndex) {
			update(($word) => {
				const $letters = get(letters);
				const letterPoolIndex = $letters.findIndex((l) => l.id === $word[wordIndex].id);
				letters.update(($letters) => {
					$letters[letterPoolIndex].used = false;
					return $letters;
				});
				$word.splice(wordIndex, 1);
				return $word;
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
