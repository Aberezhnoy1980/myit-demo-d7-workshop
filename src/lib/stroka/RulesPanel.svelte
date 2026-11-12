<script lang="ts">
	import { REGULATION, RULES } from '#lib/trainer/model';

	let { headingLevel = 2 }: { headingLevel?: 2 | 3 } = $props();
</script>

<div class="rules-panel">
	<svelte:element this={`h${headingLevel}`} class="rp-title">Правила разбора</svelte:element>
	<ol>
		{#each RULES as rule, i (i)}
			<li><b>{rule.title}.</b> {rule.text}</li>
		{/each}
	</ol>
	<svelte:element this={`h${headingLevel}`} class="rp-title">Регламент учебной мастерской</svelte:element>
	<p class="rp-note">Это сроки «Северной полки», а не общая норма. Свои сроки вы впишете в лист в конце.</p>
	<ol>
		{#each REGULATION as line, i (i)}
			<li>{line}</li>
		{/each}
	</ol>
	<p class="rp-now">Сейчас понедельник, 9:00. Рабочие дни — с понедельника по пятницу.</p>
</div>

<style>
	.rules-panel {
		font-size: 0.93rem;
		line-height: 1.45;
	}

	.rp-title {
		margin: 0 0 0.45rem;
		font-family: var(--serif);
		font-size: 1.2rem;
		line-height: 1.2;
	}

	ol {
		margin: 0 0 1rem;
		padding-left: 1.2rem;
		display: grid;
		gap: 0.4rem;
	}

	.rp-note {
		margin: -0.15rem 0 0.5rem;
		color: var(--s-muted);
		font-size: 0.88rem;
	}

	.rp-now {
		margin: 0;
		font-weight: 600;
	}
</style>
