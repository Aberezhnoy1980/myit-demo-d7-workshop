<script lang="ts">
	let { vertical = false }: { vertical?: boolean } = $props();

	/** Программа практикума, раздел 7.4 текстового пакета. */
	const program: [string, number, string][] = [
		['0–5', 5, 'Четыре правила разбора на одном примере'],
		['5–15', 10, 'Каждый заносит свои обращения: одна задача — одна строка'],
		['15–30', 15, 'Статусы и шаги; ведущий разбирает спорные строки участников'],
		['30–40', 10, 'Свой регламент и план на завтра']
	];
</script>

<ol class="timeline" class:vertical aria-label="Программа практикума, 40 минут">
	{#each program as [minutes, weight, text] (minutes)}
		<li style="--w: {weight}">
			<span class="min">{minutes} мин</span>
			<span class="text">{text}</span>
		</li>
	{/each}
</ol>

<style>
	.timeline {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		gap: 3px;
		font-size: 0.82rem;
		line-height: 1.3;
	}

	li {
		flex: var(--w) 1 0;
		min-width: 0;
		padding: 0.55rem 0.5rem 0.6rem;
		background: var(--s-client-bg);
		border-radius: 4px;
	}

	.min {
		display: block;
		margin-bottom: 0.15rem;
		font-weight: 700;
		color: var(--s-client);
		white-space: nowrap;
	}

	.vertical {
		flex-direction: column;
		gap: 4px;
	}

	.vertical li {
		flex: none;
		display: grid;
		grid-template-columns: 4.6rem minmax(0, 1fr);
		gap: 0.6rem;
		/* Высота отрезка пропорциональна длительности. */
		min-height: calc(var(--w) * 0.42rem + 1.6rem);
		align-items: start;
		padding: 0.6rem 0.75rem;
		font-size: 0.92rem;
	}

	.vertical .min {
		margin: 0;
	}

	@media (max-width: 699px) {
		.timeline {
			flex-direction: column;
		}

		li {
			flex: none;
			display: grid;
			grid-template-columns: 4.4rem minmax(0, 1fr);
			gap: 0.5rem;
		}

		.min {
			margin: 0;
		}
	}
</style>
