<script>
	import { definition, definitionWord } from '$lib/stores.js';
</script>

{#if $definitionWord !== null}
	<div
		class="bg-accent/60 dark:bg-accent/40 dark:md:hover:bg-accent/50 md:hover:bg-accent/70 fixed right-2 bottom-2 z-50 flex h-fit w-fit max-w-[320px] min-w-[180px] flex-col gap-2 rounded-lg p-3 shadow-lg backdrop-blur-xs transition-all duration-150 md:max-w-[400px] md:min-w-[225px] md:p-4 lg:top-5 lg:left-5"
	>
		<div class="relative w-full">
			<h2 class="text-text/90 text-lg font-bold md:text-2xl">{$definitionWord}</h2>
			<button
				title="Close"
				onclick={() => {
					definitionWord.set(null);
				}}
				class="text-text/60 hover:text-text absolute top-0 right-0 text-lg font-bold">✕</button
			>
		</div>

		<span class="text-text/90 text-sm md:text-base">{$definition ?? 'No definition found'}</span>
		{#if $definition}
			<div class="flex w-full justify-end">
				<a
					href={`https://en.wiktionary.org/wiki/${$definitionWord}`}
					target="_blank"
					rel="noopener noreferrer"
					class="text-text/70 hover:text-text w-fit text-sm font-medium">Read More</a
				>
			</div>
		{/if}
	</div>
{/if}
