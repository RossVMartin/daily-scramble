import { derived, writable } from 'svelte/store';
import { createWordStore, localStorageStore, derivedWritable } from './customStores.js';
import { getNowUTC } from '$lib/dateUtils.js';

export const darkMode = localStorageStore('darkMode', null);
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

export const word = createWordStore();
export const wordAsString = derived(word, ($word) => $word.map((w) => w.letter).join(''));

export const allValidWords = localStorageStore('dailyScrambleWords', {});
export const validWords = derivedWritable(allValidWords, getNowUTC(), []);
