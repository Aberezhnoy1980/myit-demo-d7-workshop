<script lang="ts">
	let { href, label }: { href: string; label: string } = $props();
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<main id="content" class="moved">
	<p>Страница переехала: <a {href}>{label}</a>.</p>
</main>

<style>
	.moved {
		width: min(40rem, calc(100% - 2rem));
		margin: 3rem auto;
		font-size: 1.1rem;
	}
</style>
