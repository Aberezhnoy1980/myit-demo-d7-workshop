<script lang="ts">
	import { page } from '#lib/page';
	import SiteHeader from '#lib/SiteHeader.svelte';
</script>

<svelte:head>
	<title>Таблицы для малого бизнеса — демонстрация</title>
	<meta
		name="description"
		content="Два входа: практикум на 40 минут и пробный урок по учёту обращений."
	/>
</svelte:head>

<SiteHeader />
<main id="content" class="frame signpost">
	<p class="stamp">Демонстрация</p>
	<h1>Учёт обращений для маленькой мастерской</h1>
	<ul>
		<li><a href={page('/workshop')}>Практикум</a> — занятие и пробная регистрация.</li>
		<li><a href={page('/sample')}>Пробный урок</a> — разбор недели без формы.</li>
	</ul>
</main>
