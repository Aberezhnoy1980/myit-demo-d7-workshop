<script lang="ts">
	import type { LedgerRow } from './ledger';

	let { row, note }: { row: LedgerRow; note: string } = $props();
</script>

<figure class="slip">
	<figcaption>{row.code} · {row.channel}</figcaption>
	<p class="slip-request">{row.request}</p>
	<p class="slip-status"><span>Статус</span> {row.status}</p>
	<p class="slip-next"><span>Следующий шаг</span> {row.next}</p>
	<p class="slip-note">{note}</p>
</figure>
