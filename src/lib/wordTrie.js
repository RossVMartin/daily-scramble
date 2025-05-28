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

export function findLongestWord(letters, trieNode, currentWord = '', longest = '', depth = 0) {
	if (trieNode.isWord && currentWord.length > longest.length) {
		longest = currentWord;
	}

	for (const char of Object.keys(trieNode)) {
		if (char === 'isWord') continue;

		const index = letters.indexOf(char);
		if (index !== -1) {
			const newLetters = [...letters];
			newLetters.splice(index, 1);

			const candidate = findLongestWord(
				newLetters,
				trieNode[char],
				currentWord + char,
				longest,
				depth + 1
			);
			if (candidate.length > longest.length) {
				longest = candidate;
			}
		}
	}

	return longest;
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
export function findRandomWord(
	letters,
	trie,
	foundWords = [],
	minLength = 3,
	maxLength = Infinity, // Default to no upper limit
	lengthPreference = 0.5,
	returnMultiple = false,
	maxResults = 3
) {
	// Convert foundWords to a Set for faster lookup
	const foundWordsSet = new Set(foundWords.map((word) => word.toUpperCase()));

	// Collect all possible words within length constraints
	const letterCount = {};
	for (let letter of letters) {
		letterCount[letter] = (letterCount[letter] || 0) + 1;
	}

	const words = [];
	function traverse(node, path = '', usedLetters = {}) {
		// Only add words within the length range and not already found
		if (
			node.isWord &&
			path.length >= minLength &&
			path.length <= maxLength &&
			!foundWordsSet.has(path)
		) {
			words.push(path);
		}
		// Stop traversing if the current path is already at or beyond maxLength
		if (path.length < maxLength) {
			for (let char in node) {
				if (char !== 'isWord' && (usedLetters[char] || 0) < (letterCount[char] || 0)) {
					traverse(node[char], path + char, {
						...usedLetters,
						[char]: (usedLetters[char] || 0) + 1
					});
				}
			}
		}
	}
	traverse(trie);

	if (words.length === 0) {
		return returnMultiple ? [] : null;
	}

	// Weight words based on length and lengthPreference
	const weights = words.map((word) => {
		const lengthFactor = word.length;
		return Math.pow(lengthFactor, 1 + lengthPreference * 3);
	});

	// Normalize weights for random selection
	const totalWeight = weights.reduce((sum, w) => sum + w, 0);
	if (totalWeight === 0) {
		return returnMultiple ? [] : null;
	}

	if (returnMultiple) {
		// Select multiple words without replacement
		const selectedWords = [];
		const availableWords = [...words];
		const availableWeights = [...weights];
		let remainingWeight = totalWeight;

		for (let i = 0; i < Math.min(maxResults, availableWords.length); i++) {
			let random = Math.random() * remainingWeight;
			for (let j = 0; j < availableWords.length; j++) {
				random -= availableWeights[j];
				if (random <= 0) {
					selectedWords.push(availableWords[j]);
					remainingWeight -= availableWeights[j];
					availableWords.splice(j, 1);
					availableWeights.splice(j, 1);
					break;
				}
			}
		}
		return selectedWords;
	} else {
		// Select a single word
		let random = Math.random() * totalWeight;
		for (let i = 0; i < words.length; i++) {
			random -= weights[i];
			if (random <= 0) {
				return words[i];
			}
		}
		return words[words.length - 1];
	}
}
// processFile(path.resolve('./sowpods.txt'), path.resolve('./wordTrieSowpods.json'));
