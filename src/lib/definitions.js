import { get } from 'svelte/store';
import { definitions, definitionWord, fetchingDefinition } from './stores';

export async function fetchDefinition(word) {
	const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
	if (!res.ok) {
		throw new Error('Word not found');
	}
	const data = await res.json();
	return data;
}

export function processDefinitionData(data) {
	try {
		if (!data || typeof data !== 'object' || data?.title === 'No Definitions Found') {
			throw new Error();
		}

		const definition = data[0]?.meanings[0]?.definitions[0]?.definition;

		if (!definition) {
			throw new Error();
		}

		return definition;
	} catch (err) {
		console.log('Error fetching definition', err);
		return null;
	}
}

export async function selectDefinitionWord(word, forceEnable = false) {
	const $definitionWord = get(definitionWord);

	if (!forceEnable && word === $definitionWord) {
		definitionWord.set(null);
		return;
	}

	const $definitions = get(definitions);

	if ($definitions[word] !== undefined) {
		definitionWord.set(word);
		return;
	}

	try {
		fetchingDefinition.set(true);
		const data = await fetchDefinition(word);
		const definition = processDefinitionData(data);

		definitions.update(($definitions) => {
			return { ...$definitions, [word]: definition };
		});
	} catch (err) {
		fetchingDefinition.set(false);
		console.log(`Error fetching definition for '${word}'`, err);
		definitions.update(($definitions) => {
			return { ...$definitions, [word]: null };
		});
	}

	fetchingDefinition.set(false);
	definitionWord.set(word);
}
