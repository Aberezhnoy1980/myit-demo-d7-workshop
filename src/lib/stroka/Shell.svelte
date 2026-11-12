<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '#lib/page';
	import './screens.css';

	let { current, children }: { current: 'hub' | 'razbor' | 'praktikum'; children: Snippet } = $props();
</script>

<div class="s-page">
	<div class="s-demo">
		<p class="s-wrap">
			<strong>Демо-режим.</strong>
			<span class="s-demo-long">Школа «Строка» и практикум вымышлены, записаться нельзя. Пробный разбор работает полностью.</span>
			<span class="s-demo-short">Школа и практикум вымышлены, записаться нельзя.</span>
		</p>
	</div>
	<header class="s-wrap s-head">
		<a class="s-brand" href={page('/')} aria-current={current === 'hub' ? 'page' : undefined}>
			<span class="s-brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
			<span>
				<span class="s-brand-name">Строка</span>
				<span class="s-brand-sub">утренний разбор обращений</span>
			</span>
		</a>
		<nav class="s-nav" aria-label="Маршруты">
			<a href={page('/razbor')} aria-current={current === 'razbor' ? 'page' : undefined}>Пробный разбор</a>
			<a href={page('/praktikum')} aria-current={current === 'praktikum' ? 'page' : undefined}>Практикум</a>
		</nav>
	</header>
	<main id="content">
		{@render children()}
	</main>
	<footer class="s-wrap s-foot">
		<p>Демо-проект. Школа, мастерская, клиенты и практикум вымышлены. Данные никуда не отправляются.</p>
	</footer>
</div>
