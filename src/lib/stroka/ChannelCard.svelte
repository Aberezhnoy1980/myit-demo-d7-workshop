<script lang="ts">
	import { CHANNEL_LABEL, type Channel, type Message } from '#lib/trainer/model';

	let {
		channel,
		who,
		messages,
		compact = false
	}: { channel: Channel; who: string; messages: readonly Message[]; compact?: boolean } = $props();
</script>

<article class="card card--{channel}" class:compact aria-label="{CHANNEL_LABEL[channel]}: {who}">
	<header class="card-head">
		<span class="glyph" aria-hidden="true">
			{#if channel === 'chat'}
				<svg viewBox="0 0 20 20"><path d="M3 4h14v9H8l-4 3v-3H3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /></svg>
			{:else if channel === 'email'}
				<svg viewBox="0 0 20 20"><rect x="2.5" y="4.5" width="15" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6" /><path d="M3 5.5l7 5 7-5" fill="none" stroke="currentColor" stroke-width="1.6" /></svg>
			{:else if channel === 'call'}
				<svg viewBox="0 0 20 20"><path d="M5 3l3 1 1 4-2 1.5a9 9 0 0 0 3.5 3.5L12 11l4 1 1 3-2 2C9 17 3 11 3 5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /></svg>
			{:else}
				<svg viewBox="0 0 20 20"><rect x="3.5" y="2.5" width="13" height="15" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6" /><path d="M6.5 7h7M6.5 10h7M6.5 13h4" stroke="currentColor" stroke-width="1.6" /></svg>
			{/if}
		</span>
		<span class="channel">{CHANNEL_LABEL[channel]}</span>
		<span class="who">{who}</span>
	</header>
	<ol class="thread">
		{#each messages as message, i (i)}
			<li class="msg msg--{message.side}">
				<p class="meta">{message.author} · {message.when}</p>
				<p class="text">{message.text}</p>
			</li>
		{/each}
	</ol>
</article>

<style>
	.card {
		background: var(--s-card);
		border: 1px solid var(--s-rule);
		border-radius: var(--s-radius);
		box-shadow: var(--s-shadow);
		padding: 0.85rem 0.95rem 0.95rem;
		min-width: 0;
	}

	.card-head {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin-bottom: 0.6rem;
		color: var(--s-muted);
		font-size: 0.82rem;
	}

	.glyph svg {
		display: block;
		width: 1.15rem;
		height: 1.15rem;
		color: var(--s-ink);
	}

	.channel {
		font-weight: 600;
		color: var(--s-ink);
		letter-spacing: 0.02em;
	}

	.who::before {
		content: '·';
		margin-right: 0.45rem;
	}

	.thread {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.55rem;
	}

	.msg {
		max-width: 88%;
		padding: 0.55rem 0.75rem;
		border-radius: 14px;
	}

	.msg p {
		margin: 0;
	}

	.meta {
		font-size: 0.76rem;
		color: var(--s-muted);
		margin-bottom: 0.15rem !important;
	}

	.text {
		font-size: 1rem;
		line-height: 1.4;
	}

	.card--chat .msg--client {
		background: #efe9dd;
		border-bottom-left-radius: 4px;
		justify-self: start;
	}

	.card--chat .msg--us {
		background: #e3ecdf;
		border-bottom-right-radius: 4px;
		justify-self: end;
	}

	.card--email .msg,
	.card--form .msg,
	.card--call .msg {
		max-width: none;
		border-radius: 0;
		padding: 0.1rem 0 0.1rem 0.7rem;
		border-left: 3px solid var(--s-rule);
	}

	.card--email .msg--client,
	.card--form .msg--client,
	.card--call .msg--client {
		border-left-color: var(--s-ink);
	}

	.compact {
		padding: 0.6rem 0.7rem 0.7rem;
	}

	.compact .card-head {
		margin-bottom: 0.4rem;
		font-size: 0.76rem;
	}

	.compact .text {
		font-size: 0.9rem;
	}

	.compact .msg {
		max-width: 100%;
	}
</style>
