import fs from 'fs/promises'; // Modern promise-based fs
import path from 'path';

// Function to build a Trie from the word list
function buildTrie(words) {
	const trie = {};
	for (const word of words) {
		let node = trie;
		for (const char of word.toUpperCase()) {
			if (!node[char]) {
				node[char] = {};
			}
			node = node[char];
		}
		node.isWord = true; // Mark the end of a word
	}
	return trie;
}

export function isValidWord(word, wordTrie) {
	let node = wordTrie;
	for (const char of word.toUpperCase()) {
		if (!node[char]) return false; // Letter path breaks
		node = node[char];
	}
	return !!node.isWord; // Check if it’s a complete word
}

// export const wordTrie = buildTrie(words);

export async function processFile(inputFilePath, outputFilePath) {
	try {
		console.log(`Reading word list from ${inputFilePath}`);
		const data = await fs.readFile(inputFilePath, 'utf-8');

		// Split the text by lines and filter out empty lines
		const words = data
			.split(/\r?\n/)
			.map((w) => w.trim())
			.filter((w) => w.length > 0);

		console.log(`Processing ${words.length} words...`);

		const trie = buildTrie(words);

		console.log(`Writing Trie to ${outputFilePath}`);
		await fs.writeFile(outputFilePath, JSON.stringify(trie, null, 2), 'utf-8');

		console.log('Process complete!');
	} catch (error) {
		console.error('Error processing file:', error);
	}
}

// processFile(path.resolve('./sowpods.txt'), path.resolve('./wordTrieSowpods.json'));
