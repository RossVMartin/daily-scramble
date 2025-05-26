/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,svelte,js,ts}'],
	theme: {
		extend: {
			colors: {
				bg: 'hsl(var(--color-bg))' // Wrap in hsl() for PostCSS compatibility
			}
		}
	},
	plugins: []
};
