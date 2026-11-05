<script lang="ts">
	import type { LedgerRow } from './ledger';

	let {
		rows,
		caption,
		brief = false
	}: { rows: readonly LedgerRow[]; caption: string; brief?: boolean } = $props();
</script>

<div class="ledger-wrap" class:brief>
	<table class="ledger">
		<caption>{caption}</caption>
		<thead>
			<tr>
				<th scope="col">Дата</th>
				{#if !brief}
					<th scope="col">Шифр</th>
					<th scope="col">Канал</th>
				{/if}
				<th scope="col">Суть</th>
				<th scope="col">Статус</th>
				{#if !brief}
					<th scope="col">Следующий шаг</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.code)}
				<tr>
					<td data-label="Дата">{row.date}</td>
					{#if !brief}
						<td data-label="Шифр">{row.code}</td>
						<td data-label="Канал">{row.channel}</td>
					{/if}
					<td data-label="Суть">{row.request}</td>
					<td data-label="Статус">{row.status}</td>
					{#if !brief}
						<td data-label="Следующий шаг">{row.next}</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
