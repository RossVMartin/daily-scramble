import { json } from '@sveltejs/kit';
import { WORDNIK_API_KEY } from '$env/static/private';

export async function GET({ url }) {
	return json({ message: 'N/A' });
	const word = url.searchParams.get('word');
	if (!word) return json({ error: 'Word parameter is required' }, { status: 400 });

	try {
		const response = await fetch(
			`http://api.wordnik.com/v4/word.json/${word.toLowerCase()}/definitions?limit=1&sourceDictionaries=all&api_key=${WORDNIK_API_KEY}`
		);
		const data = await response.json();
		if (data.length > 0) {
			return json({ definition: data[0].text });
		}
		return json({ definition: 'No definition found' }, { status: 200 });
	} catch (error) {
		console.error('Error fetching Wordnik definition:', error);
		return json({ definition: 'No definition found' }, { status: 500 });
	}
}
