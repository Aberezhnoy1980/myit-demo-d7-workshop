<script lang="ts">
	import { STATUS_LABEL, type Status } from '#lib/trainer/model';

	let { status, size = 'md' }: { status: Status; size?: 'sm' | 'md' } = $props();
</script>

<!-- Знак «чей ход»: метка у мастерской (слева) — ждёт нас, у клиента (справа) — ждёт клиента, перечёркнутая линия — закрыто. -->
<span class="stamp stamp--{status} stamp--{size}">
	<svg class="turn" viewBox="0 0 40 14" aria-hidden="true" focusable="false">
		{#if status === 'closed'}
			<line x1="5" y1="7" x2="35" y2="7" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 3" />
			<line x1="16" y1="2" x2="24" y2="12" stroke="currentColor" stroke-width="1.8" />
		{:else}
			<line x1="5" y1="7" x2="35" y2="7" stroke="currentColor" stroke-width="1.6" />
			<circle cx="5" cy="7" r="3" fill="none" stroke="currentColor" stroke-width="1.4" />
			<circle cx="35" cy="7" r="3" fill="none" stroke="currentColor" stroke-width="1.4" />
			{#if status === 'us'}
				<circle cx="5" cy="7" r="4.6" fill="currentColor" />
			{:else if status === 'client'}
				<circle cx="35" cy="7" r="4.6" fill="currentColor" />
			{/if}
		{/if}
	</svg>
	<span class="label">{STATUS_LABEL[status]}</span>
</span>

<style>
	.stamp {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.18rem 0.55rem 0.18rem 0.4rem;
		border-radius: 999px;
		border: 1.5px solid currentColor;
		font-weight: 600;
		line-height: 1.2;
		white-space: nowrap;
	}

	.stamp--md {
		font-size: 0.88rem;
	}

	.stamp--sm {
		font-size: 0.78rem;
		padding: 0.1rem 0.45rem 0.1rem 0.3rem;
	}

	.turn {
		width: 2.1em;
		height: 0.75em;
		flex: none;
	}

	.stamp--us {
		color: var(--s-us);
		background: var(--s-us-bg);
	}

	.stamp--client {
		color: var(--s-client);
		background: var(--s-client-bg);
	}

	.stamp--closed {
		color: var(--s-closed);
		background: var(--s-closed-bg);
	}

	.stamp--closed .label {
		text-decoration: line-through;
		text-decoration-thickness: 1.5px;
	}

	.stamp--new {
		color: var(--s-muted);
		background: transparent;
		border-style: dashed;
	}
</style>
