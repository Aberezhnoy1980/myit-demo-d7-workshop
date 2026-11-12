<script lang="ts">
	import type { Snippet } from 'svelte';
	import { RULES, countPlan, type Row } from '#lib/trainer/model';
	import StatusStamp from './StatusStamp.svelte';

	let {
		rows,
		sample = false,
		regulation,
		footnote = ''
	}: {
		rows: readonly Row[];
		/** Образец на хабе: помечается тегом «Образец». */
		sample?: boolean;
		/** Блок «Мой регламент» — только в настоящем листе. */
		regulation?: Snippet;
		footnote?: string;
	} = $props();

	const counts = $derived(countPlan(rows));
	const today = $derived(rows.filter((row) => row.status !== 'closed' && row.when === 'сегодня'));
	const wednesday = $derived(rows.filter((row) => row.when === 'в эту среду'));
	const closed = $derived(rows.filter((row) => row.status === 'closed'));
	const line = (row: Row) => `${row.task.toLowerCase()} — ${row.step.toLowerCase()}`;
</script>

<article class="sheet" class:sample aria-label={sample ? 'Образец листа утреннего разбора' : 'Лист утреннего разбора'}>
	<header class="sheet-head">
		{#if sample}<p class="tag">Образец</p>{/if}
		<h3>Утренний разбор · мастерская «Северная полка» · понедельник</h3>
		{#if !sample}<p class="sub">Учебная неделя · демо-проект школы «Строка»</p>{/if}
	</header>

	<section class="plan" aria-label="План на день">
		<h4><span class="num" aria-hidden="true">1</span>План на день</h4>
		<p class="group">Сегодня — {counts.today}</p>
		<ul class="checks">
			{#each today as row (row.id)}
				<li><span class="box" aria-hidden="true"></span><b>{row.who}</b> · {line(row)}</li>
			{/each}
		</ul>
		<p class="group">Среда — {counts.wednesday}</p>
		<ul class="checks">
			{#each wednesday as row (row.id)}
				<li><span class="box" aria-hidden="true"></span><b>{row.who}</b> · {line(row)}</li>
			{/each}
		</ul>
		<p class="group group--closed">Закрыто на прошлой неделе — {counts.closed}</p>
		<ul class="checks checks--closed">
			{#each closed as row (row.id)}
				<li><b>{row.who}</b> · {line(row)}</li>
			{/each}
		</ul>
	</section>

	<section class="tasks" aria-label="Таблица задач">
		<h4><span class="num" aria-hidden="true">2</span>Таблица задач · {rows.length}</h4>
		<ul>
			{#each rows as row (row.id)}
				<li>
					<span class="who"><b>{row.who}</b> {row.task}<span class="ch">{row.channels}</span></span>
					<StatusStamp status={row.status} size="sm" />
					<span class="step">{row.step}{row.when !== '—' ? ` · ${row.when}` : ''}</span>
				</li>
			{/each}
		</ul>
	</section>

	<section class="rules" aria-label="Правила разбора">
		<h4><span class="num" aria-hidden="true">3</span>Правила разбора</h4>
		<ol>
			{#each RULES as rule, i (i)}
				<li><b>{rule.title}.</b> {rule.short}</li>
			{/each}
		</ol>
	</section>

	{#if regulation}
		<section class="regulation" aria-label="Мой регламент">
			<h4><span class="num" aria-hidden="true">4</span>Мой регламент</h4>
			{@render regulation()}
		</section>
	{/if}

	{#if footnote}
		<p class="footnote">{footnote}</p>
	{/if}
</article>

<style>
	.sheet {
		display: grid;
		gap: 1.1rem;
		background: #fff;
		border: 1px solid var(--s-rule);
		border-radius: 4px;
		box-shadow: 0 1px 0 rgba(28, 25, 21, 0.06), 0 18px 40px -24px rgba(28, 25, 21, 0.45);
		padding: 1.2rem 1.3rem 1.3rem;
		font-size: 0.92rem;
		line-height: 1.4;
		min-width: 0;
	}

	.sheet p,
	.sheet h3,
	.sheet h4 {
		margin: 0;
	}

	.sheet-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem 0.8rem;
		padding-bottom: 0.6rem;
		border-bottom: 1.5px solid var(--s-ink);
	}

	.sheet-head h3 {
		font-family: var(--serif);
		font-size: 1.12rem;
		line-height: 1.2;
		letter-spacing: -0.01em;
	}

	.sub {
		flex-basis: 100%;
		color: var(--s-muted);
		font-size: 0.8rem;
	}

	.tag {
		order: -1;
		padding: 0.05rem 0.45rem;
		border: 1.5px dashed var(--s-muted);
		border-radius: 4px;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--s-muted);
	}

	h4 {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin-bottom: 0.45rem !important;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--s-muted);
	}

	.num {
		display: inline-grid;
		place-items: center;
		width: 1.35rem;
		height: 1.35rem;
		border-radius: 50%;
		background: var(--s-ink);
		color: #fff;
		font-size: 0.75rem;
		letter-spacing: 0;
	}

	.group {
		margin-top: 0.45rem !important;
		font-weight: 700;
		color: var(--s-us);
	}

	.group:first-of-type {
		margin-top: 0 !important;
	}

	.group--closed {
		color: var(--s-closed);
	}

	.checks {
		list-style: none;
		margin: 0.2rem 0 0;
		padding: 0;
		display: grid;
		gap: 0.15rem;
	}

	.checks li {
		position: relative;
		padding-left: 1.2rem;
	}

	.checks--closed li {
		padding-left: 0;
		color: var(--s-muted);
	}

	.box {
		position: absolute;
		left: 0;
		top: 0.25em;
		width: 0.75rem;
		height: 0.75rem;
		border: 1.5px solid var(--s-ink);
		border-radius: 2px;
	}

	.tasks ul {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--s-rule);
	}

	.tasks li {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.25rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--s-rule);
	}

	.who b {
		margin-right: 0.3rem;
	}

	.ch {
		display: block;
		color: var(--s-muted);
		font-size: 0.8rem;
	}

	.tasks :global(.stamp) {
		justify-self: start;
	}

	.rules ol {
		margin: 0;
		padding-left: 1.15rem;
		display: grid;
		gap: 0.3rem;
	}

	.footnote {
		padding-top: 0.6rem;
		border-top: 1px solid var(--s-rule);
		color: var(--s-muted);
		font-size: 0.85rem;
	}

	@media (min-width: 760px) {
		.tasks li {
			grid-template-columns: minmax(0, 1.1fr) 10.5rem minmax(0, 1.3fr);
			align-items: center;
			gap: 0.8rem;
		}

		.rules ol {
			grid-template-columns: 1fr 1fr;
			column-gap: 1.6rem;
		}
	}

	/* Печать: A4, основной текст не меньше 10 pt, план — не меньше 12 pt. */
	@media print {
		.sheet {
			display: block;
			border: 0;
			box-shadow: none;
			padding: 0;
			font-size: 10.5pt;
			line-height: 1.35;
		}

		.sheet > * + * {
			margin-top: 9pt;
		}

		.sheet-head h3 {
			font-size: 15pt;
		}

		.sub,
		.ch,
		.footnote {
			font-size: 10pt;
		}

		h4 {
			font-size: 10pt;
		}

		.plan {
			font-size: 12pt;
		}

		.plan,
		.tasks li,
		.rules,
		.regulation {
			break-inside: avoid;
		}

		.tasks li {
			grid-template-columns: 1.1fr 11.5em 1.3fr;
			align-items: center;
			gap: 8pt;
			padding: 4pt 0;
		}

		.rules ol {
			grid-template-columns: 1fr 1fr;
			column-gap: 14pt;
		}

		.num {
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
	}
</style>
