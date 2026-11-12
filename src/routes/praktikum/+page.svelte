<script lang="ts">
	import { page } from '#lib/page';
	import Shell from '#lib/stroka/Shell.svelte';
	import EnrollForm from '#lib/stroka/EnrollForm.svelte';
	import Timeline from '#lib/stroka/Timeline.svelte';

	const compare: [string, string, string][] = [
		['Что разбираете', 'Учебную неделю мастерской «Северная полка»', 'Свои переписки за последнюю неделю'],
		[
			'Факты',
			'Подготовлены заранее: всё нужное для ответа есть в карточке',
			'В настоящей переписке детали теряются — ведущий помогает понять, чего ждут и от кого'
		],
		[
			'Спорные задачи',
			'У каждого вопроса один обоснованный ответ',
			'Задачи, где неясно, одна это строка или две и чей ход, — разбираете вместе'
		],
		['Сроки', 'Из регламента учебной мастерской', 'Те, что вы уже пообещали своим клиентам'],
		['Регламент', 'Готовый, учебный', 'Ваш собственный: когда отвечаете, напоминаете, выезжаете']
	];
</script>

<svelte:head>
	<title>Практикум с ведущим — Строка</title>
	<meta
		name="description"
		content="Онлайн-практикум на 40 минут: разберите свои обращения с ведущим и уйдите с таблицей своей недели, планом на завтра и своим регламентом."
	/>
</svelte:head>

<Shell current="praktikum">
	<section class="s-wrap hero" aria-labelledby="pr-title">
		<div class="hero-text">
			<p class="s-eyebrow">Практикум школы «Строка» · онлайн</p>
			<h1 id="pr-title">Разберите свои обращения с ведущим за 40 минут</h1>
			<p class="lede">
				Для мастеров и владельцев небольших мастерских и студий, которые сами отвечают клиентам в чатах и по
				телефону. Принесите 5–10 обращений за неделю — уйдёте с таблицей своей недели, планом на завтра и
				своим регламентом.
			</p>
			<dl class="facts">
				<div><dt>Формат</dt><dd>онлайн</dd></div>
				<div><dt>Длительность</dt><dd>40 минут</dd></div>
				<div><dt>Группа</dt><dd>8 человек</dd></div>
				<div><dt>Дата</dt><dd>предложим, когда группа соберётся</dd></div>
			</dl>
			<div class="actions">
				<a class="s-btn" href="#zapis">Записаться в группу</a>
				<a class="s-btn s-btn--quiet" href={page('/razbor')}>Сначала попробовать самому</a>
			</div>
		</div>
		<aside class="program" aria-labelledby="program-title">
			<h2 id="program-title">Как пройдут 40 минут</h2>
			<Timeline vertical />
		</aside>
	</section>

	<section class="s-wrap block" aria-labelledby="why-title">
		<p class="s-eyebrow">Зачем ведущий</p>
		<h2 id="why-title">Проба показывает правила. Практикум переносит их на вашу работу</h2>
		<div class="compare" role="table" aria-label="Пробный разбор и практикум с ведущим">
			<div class="c-row c-head" role="row">
				<span role="columnheader" class="c-label"></span>
				<span role="columnheader" class="c-self">Пробный разбор</span>
				<span role="columnheader" class="c-group">Практикум с ведущим</span>
			</div>
			{#each compare as [label, self, group] (label)}
				<div class="c-row" role="row">
					<span role="rowheader" class="c-label">{label}</span>
					<span role="cell" class="c-self"><span class="c-mobile">Проба: </span>{self}</span>
					<span role="cell" class="c-group"><span class="c-mobile">Практикум: </span>{group}</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="s-wrap block bring" aria-labelledby="bring-title">
		<h2 id="bring-title" class="sr-only">Что подготовить и что унесёте</h2>
		<div class="bring-col">
			<p class="s-eyebrow">Что подготовить</p>
			<ul>
				<li>5–10 обращений за последнюю неделю — скриншоты или выписки, <b>без фамилий и телефонов клиентов</b>.</li>
				<li>Где вести таблицу: Google Таблицы, Excel или лист бумаги. Устанавливать ничего не нужно.</li>
				<li>Компьютер или планшет со звуком.</li>
			</ul>
		</div>
		<div class="bring-arrow" aria-hidden="true">→</div>
		<div class="bring-col bring-col--out">
			<p class="s-eyebrow">Что унесёте</p>
			<ul>
				<li>Таблицу своей недели: одна задача — одна строка, у каждой статус и следующий шаг.</li>
				<li>План на завтра: что сделать, кому напомнить и в какой день.</li>
				<li>Свой регламент: когда отвечаете, когда напоминаете, когда выезжаете или встречаетесь.</li>
				<li>Время ежедневного разбора в своей неделе.</li>
			</ul>
		</div>
	</section>

	<section class="s-wrap block fit" aria-labelledby="fit-title">
		<h2 id="fit-title">Кому подойдёт</h2>
		<div class="fit-grid">
			<ul class="fit-yes" aria-label="Подойдёт">
				<li>Вы сами отвечаете клиентам.</li>
				<li>Обращения приходят в несколько каналов: мессенджеры, телефон, почта, сайт.</li>
				<li>Бывает, что вспоминаете о клиенте позже, чем хотелось бы.</li>
			</ul>
			<div>
				<p class="fit-no-title">Не подойдёт, если</p>
				<ul class="fit-no" aria-label="Не подойдёт">
					<li>обращения ведёт администратор или CRM;</li>
					<li>заявок сотни в неделю из рекламы — нужен другой инструмент;</li>
					<li>нужен учёт продаж, денег или склада.</li>
				</ul>
			</div>
		</div>
	</section>

	<section class="s-wrap block" aria-labelledby="set-title">
		<p class="s-eyebrow">Без фиксированной даты</p>
		<h2 id="set-title">Как собирается группа</h2>
		<ol class="steps">
			<li><span class="n">1</span><p><b>Записываетесь в группу.</b> Имя и контакт — больше ничего.</p></li>
			<li><span class="n">2</span><p><b>В группе восемь человек.</b> Тогда всем приходит письмо с двумя-тремя вариантами даты.</p></li>
			<li><span class="n">3</span><p><b>Выбираете удобную дату</b> и приходите со своими обращениями.</p></li>
		</ol>
		<p class="meanwhile">
			Пока группа собирается, можно <a href={page('/razbor')}>пройти пробный разбор</a>: правила те же.
		</p>
	</section>

	<section class="s-wrap block form-block" id="zapis" aria-labelledby="zapis-title">
		<div class="form-intro">
			<h2 id="zapis-title">Запись в группу</h2>
			<p>Оставьте имя и контакт — когда группа соберётся, пришлём варианты даты.</p>
		</div>
		<div class="form-card">
			<EnrollForm />
		</div>
	</section>
</Shell>

<style>
	h1 {
		margin: 0 0 1rem;
		font-family: var(--serif);
		font-weight: 600;
		font-size: clamp(2.1rem, 4.6vw, 3.5rem);
		line-height: 1.04;
		letter-spacing: -0.025em;
		text-wrap: balance;
	}

	h2 {
		margin: 0 0 1rem;
		font-family: var(--serif);
		font-size: clamp(1.5rem, 2.8vw, 2.1rem);
		line-height: 1.15;
		letter-spacing: -0.02em;
		text-wrap: balance;
	}

	.hero {
		display: grid;
		gap: 1.8rem;
		padding: 2rem 0 2.4rem;
	}

	.hero > * {
		min-width: 0;
	}

	.lede {
		max-width: 36rem;
		margin: 0;
		font-size: 1.12rem;
		line-height: 1.5;
	}

	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 1.2rem 0 0;
	}

	.facts div {
		padding: 0.4rem 0.75rem;
		background: var(--s-card);
		border: 1px solid var(--s-rule);
		border-radius: 8px;
	}

	.facts dt {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--s-muted);
	}

	.facts dd {
		margin: 0;
		font-weight: 600;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
		margin-top: 1.3rem;
	}

	.program {
		padding: 1.2rem;
		background: var(--s-card);
		border: 1px solid var(--s-rule);
		border-radius: calc(var(--s-radius) + 4px);
		border-top: 5px solid var(--s-client);
	}

	.program h2 {
		font-size: 1.3rem;
		margin-bottom: 0.8rem;
	}

	.block {
		padding: 2.2rem 0;
		border-top: 1px solid var(--s-rule);
	}

	/* Сравнение пробы и практикума */

	.compare {
		display: grid;
		border: 1px solid var(--s-rule);
		border-radius: calc(var(--s-radius) + 4px);
		overflow: hidden;
		background: var(--s-card);
	}

	.c-row {
		display: grid;
		grid-template-columns: 10rem minmax(0, 1fr) minmax(0, 1.2fr);
		border-top: 1px solid var(--s-rule);
	}

	.c-row > span {
		padding: 0.8rem 1rem;
		min-width: 0;
	}

	.c-head {
		border-top: 0;
	}

	.c-head span {
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.c-head .c-self {
		color: var(--s-us);
	}

	.c-head .c-group {
		color: var(--s-client);
	}

	.c-label {
		font-weight: 600;
		color: var(--s-muted);
	}

	.c-group {
		background: #eef4f8;
	}

	.c-row:not(.c-head) .c-group {
		font-weight: 600;
	}

	.c-mobile {
		display: none;
	}

	/* Подготовить → унесёте */

	.bring {
		display: grid;
		gap: 1rem;
		align-items: stretch;
	}

	.bring-col {
		padding: 1.2rem;
		background: var(--s-card);
		border: 1px solid var(--s-rule);
		border-radius: calc(var(--s-radius) + 4px);
		min-width: 0;
	}

	.bring-col--out {
		border-color: var(--s-client);
		background: #f3f8fb;
	}

	.bring ul {
		margin: 0;
		padding-left: 1.1rem;
		display: grid;
		gap: 0.45rem;
	}

	.bring-arrow {
		display: grid;
		place-items: center;
		font-size: 1.8rem;
		color: var(--s-line);
	}

	/* Кому подойдёт */

	.fit-grid {
		display: grid;
		gap: 1.2rem;
	}

	.fit-yes,
	.fit-no {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.5rem;
	}

	.fit-yes li,
	.fit-no li {
		position: relative;
		padding-left: 1.8rem;
	}

	.fit-yes li::before,
	.fit-no li::before {
		position: absolute;
		left: 0;
		top: 0;
		font-weight: 700;
	}

	.fit-yes li::before {
		content: '✓';
		color: var(--s-good);
	}

	.fit-no li::before {
		content: '✕';
		color: var(--s-muted);
	}

	.fit-no {
		color: var(--s-muted);
	}

	.fit-no-title {
		margin: 0 0 0.5rem;
		font-weight: 700;
	}

	/* Набор */

	.steps {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.8rem;
	}

	.steps li {
		display: grid;
		grid-template-columns: 2.4rem minmax(0, 1fr);
		gap: 0.8rem;
		align-items: start;
		padding: 1rem;
		background: var(--s-card);
		border: 1px solid var(--s-rule);
		border-radius: var(--s-radius);
	}

	.steps p {
		margin: 0.35rem 0 0;
	}

	.n {
		display: grid;
		place-items: center;
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 50%;
		background: var(--s-client);
		color: #fff;
		font-family: var(--serif);
		font-weight: 600;
		font-size: 1.1rem;
	}

	.meanwhile {
		margin: 1rem 0 0;
		color: var(--s-muted);
	}

	.meanwhile a {
		color: var(--s-ink);
		font-weight: 600;
	}

	/* Форма */

	.form-block {
		display: grid;
		gap: 1.4rem;
		scroll-margin-top: 1rem;
	}

	.form-intro p {
		margin: 0;
		max-width: 28rem;
		color: var(--s-muted);
	}

	.form-card {
		padding: 1.3rem;
		background: var(--s-card);
		border: 1.5px solid var(--s-ink);
		border-radius: calc(var(--s-radius) + 4px);
		min-width: 0;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	@media (min-width: 1000px) {
		.hero {
			grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
			gap: 3rem;
			align-items: start;
			padding: 2.6rem 0 3rem;
		}

		.bring {
			grid-template-columns: minmax(0, 1fr) 3rem minmax(0, 1fr);
		}

		.fit-grid {
			grid-template-columns: 1fr 1fr;
			gap: 2.5rem;
		}

		.steps {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.steps li {
			grid-template-columns: 1fr;
		}

		.steps p {
			margin: 0;
		}

		.form-block {
			grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
			gap: 3rem;
			align-items: start;
		}

		.form-card {
			padding: 1.8rem;
		}
	}

	@media (max-width: 999px) {
		.bring-arrow {
			rotate: 90deg;
			height: 1.5rem;
		}
	}

	@media (max-width: 699px) {
		.hero {
			padding: 1.2rem 0 1.8rem;
		}

		.lede {
			font-size: 1.04rem;
		}

		.actions .s-btn {
			flex: 1 1 100%;
		}

		.c-head {
			display: none;
		}

		.c-row {
			grid-template-columns: 1fr;
			padding: 0.8rem 0;
		}

		.c-row:first-of-type + .c-row {
			border-top: 0;
		}

		.c-row > span {
			padding: 0.2rem 0.9rem;
		}

		.c-label {
			color: var(--s-ink);
			font-weight: 700;
		}

		.c-group {
			background: transparent;
		}

		.c-mobile {
			display: inline;
			font-weight: 700;
		}

		.c-self .c-mobile {
			color: var(--s-us);
		}

		.c-group .c-mobile {
			color: var(--s-client);
		}

		.form-card {
			padding: 1rem;
		}
	}
</style>
