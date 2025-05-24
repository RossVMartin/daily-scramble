<script>
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Daily Scramble</title>
</svelte:head>

{@render children()}
