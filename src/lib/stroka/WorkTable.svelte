<script lang="ts">
	import type { Row } from '#lib/trainer/model';
	import StatusStamp from './StatusStamp.svelte';

	let {
		rows,
		focus = [],
		before = []
	}: {
		rows: readonly Row[];
		/** Строки текущего обращения — подсвечиваются. */
		focus?: readonly string[];
		/** Таблица до открытия обращения — для подписи «было» и новых строк. */
		before?: readonly Row[];
	} = $props();

	const prev = $derived(new Map(before.map((row) => [row.id, row])));
</script>

<table class="wt">
	<caption class="sr-only">Рабочая таблица мастерской «Северная полка»</caption>
	<thead>
		<tr>
			<th scope="col">Кто и задача</th>
			<th scope="col">Статус</th>
			<th scope="col">Следующий шаг</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as row (row.id)}
			{@const current = focus.includes(row.id)}
			{@const was = prev.get(row.id)}
			<tr class:current class:pending={!row.reviewed && !current}>
				<th scope="row">
					<span class="who">{row.who}</span>
					<span class="task" class:flash={current && was && was.task !== row.task}>{row.task}</span>
					<span class="channels" class:flash={current && was && was.channels !== row.channels}>{row.channels}</span>
					{#if current && !was}
						<span class="new-tag">новая строка</span>
					{/if}
				</th>
				<td class:flash={current && was && was.status !== row.status}>
					{#if current && was && was.status !== row.status}
						<span class="was"><span class="sr-only">было: </span><StatusStamp status={was.status} size="sm" /></span>
					{/if}
					<StatusStamp status={row.status} size="sm" />
				</td>
				<td class:flash={current && was && (was.step !== row.step || was.when !== row.when)}>
					<span class="step">{row.step}</span>
					{#if row.when !== '—'}
						<span class="when" class:late={row.when.startsWith('прошлый')}>{row.when}</span>
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.wt {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		font-size: 0.92rem;
		table-layout: fixed;
	}

	thead th {
		padding: 0 0.7rem 0.45rem;
		text-align: left;
		font-size: 0.74rem;
		font-weight: 600;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--s-muted);
		border-bottom: 1.5px solid var(--s-ink);
	}

	thead th:nth-child(1) {
		width: 34%;
	}

	thead th:nth-child(2) {
		width: 28%;
	}

	tbody th,
	tbody td {
		padding: 0.65rem 0.7rem;
		vertical-align: top;
		text-align: left;
		border-bottom: 1px solid var(--s-rule);
		overflow-wrap: anywhere;
		transition: background-color 400ms ease;
	}

	tbody th {
		font-weight: 400;
	}

	.who {
		display: block;
		font-weight: 600;
	}

	.task,
	.channels,
	.step {
		display: block;
	}

	.channels {
		color: var(--s-muted);
		font-size: 0.8rem;
	}

	.when {
		display: inline-block;
		margin-top: 0.2rem;
		font-weight: 600;
		font-size: 0.85rem;
	}

	.when.late {
		color: var(--s-muted);
		font-weight: 400;
		text-decoration: line-through;
		text-decoration-color: var(--s-line);
	}

	.new-tag {
		display: inline-block;
		margin-top: 0.3rem;
		padding: 0 0.4rem;
		border: 1px dashed var(--s-muted);
		border-radius: 4px;
		font-size: 0.72rem;
		color: var(--s-muted);
	}

	.was {
		display: block;
		margin-bottom: 0.2rem;
		opacity: 0.55;
	}

	.was::before {
		content: 'было';
		display: block;
		font-size: 0.72rem;
		color: var(--s-muted);
	}

	tr.current th,
	tr.current td {
		background: #fff8e5;
	}

	tr.current th {
		box-shadow: inset 4px 0 0 var(--s-ink);
	}

	tr.pending {
		color: var(--s-muted);
	}

	td.flash,
	span.flash {
		background: #fbe8a6;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
</style>
