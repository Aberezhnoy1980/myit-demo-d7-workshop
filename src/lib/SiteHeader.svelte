<script lang="ts">
	import { page } from '#lib/page';

	let { asideHref = '', asideLabel = '' }: { asideHref?: string; asideLabel?: string } = $props();
</script>

<header class="masthead">
	<a class="brand" href={page('/')}>
		<span class="brand-mark" aria-hidden="true"></span>
		<span>
			<span class="brand-name">Таблицы</span>
			<span class="brand-sub">для малого бизнеса</span>
		</span>
	</a>
	{#if asideHref && asideLabel}
		<a class="mast-link" href={asideHref}>{asideLabel}</a>
	{/if}
</header>
