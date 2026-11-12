<script lang="ts">
	import { page } from '#lib/page';
	import Shell from '#lib/stroka/Shell.svelte';
	import ChannelCard from '#lib/stroka/ChannelCard.svelte';
	import WorkSheet from '#lib/stroka/WorkSheet.svelte';
	import { FINAL_ROWS } from '#lib/trainer/sample';
	import StatusStamp from '#lib/stroka/StatusStamp.svelte';
	import Timeline from '#lib/stroka/Timeline.svelte';
</script>

<svelte:head>
	<title>Строка — утренний разбор обращений</title>
	<meta
		name="description"
		content="Пробный разбор учебной недели мастерской и практикум с ведущим: таблица, где у каждой задачи видно, чей ход и следующий шаг."
	/>
</svelte:head>

<Shell current="hub">
	<section class="s-wrap hero" aria-labelledby="hero-title">
		<div class="hero-text">
			<p class="s-eyebrow">Для мастеров и небольших мастерских, которые сами отвечают клиентам</p>
			<h1 id="hero-title">Кому я сегодня должен ответить?</h1>
			<p class="lede">
				Клиенты пишут в мессенджер, звонят и присылают письма. Через неделю уже непонятно, кто ждёт вас, а
				кого ждёте вы.
			</p>
			<p class="lede">
				Утренний разбор — десять минут с одной таблицей. Вы сами проходите сообщения и для каждой задачи
				отмечаете <strong>чей сейчас ход</strong> и <strong>следующий шаг</strong>.
			</p>
			<p class="offer">
				Попробуйте метод на учебной неделе мастерской — или разберите свои обращения с ведущим.
			</p>
			<div class="hero-actions">
				<a class="s-btn" href={page('/razbor')}>Начать пробный разбор</a>
				<a class="s-btn s-btn--quiet" href={page('/praktikum')}>О практикуме с ведущим</a>
			</div>
			<p class="hero-note">
				После разбора остаются лист с планом на день, правила и шаблон таблицы для своей недели.
			</p>
		</div>

		<figure class="schema">
			<figcaption class="schema-cap">
				<span class="cap-title">Пример ручного разбора</span>
				<span class="cap-sub">Вы читаете сообщения и сами решаете, что записать в таблицу</span>
			</figcaption>
			<div class="schema-cols" aria-hidden="true">
				<span>Что пришло</span>
				<span>Что вы записали</span>
			</div>
			<div class="schema-grid">
				<div class="in in-1">
					<ChannelCard
						compact
						channel="chat"
						who="Анна"
						messages={[{ side: 'client', author: 'Анна', when: 'пт, 21:40', text: 'Полку 90 см сделаете? Сколько будет стоить?' }]}
					/>
				</div>
				<div class="in in-2">
					<ChannelCard
						compact
						channel="call"
						who="Анна"
						messages={[{ side: 'client', author: 'Пропущенный', when: 'пн, 8:50', text: '«Я писала про полку. Перезвоните, пожалуйста»' }]}
					/>
				</div>
				<div class="in in-3 optional">
					<ChannelCard
						compact
						channel="email"
						who="Сергей"
						messages={[{ side: 'client', author: 'Сергей', when: 'пт', text: 'Спасибо, я подумаю.' }]}
					/>
				</div>
				<div class="in in-4 optional">
					<ChannelCard
						compact
						channel="form"
						who="Дмитрий"
						messages={[{ side: 'client', author: 'Дмитрий', when: 'ср', text: 'Уже заказали в другом месте.' }]}
					/>
				</div>

				<div class="link link-a" aria-hidden="true">
					<svg viewBox="0 0 100 100" preserveAspectRatio="none">
						<path d="M0 25 H45 V75 H0 M45 50 H96" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" />
					</svg>
				</div>
				<div class="link link-b optional" aria-hidden="true">
					<svg viewBox="0 0 100 100" preserveAspectRatio="none">
						<path d="M0 50 H96" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" />
					</svg>
				</div>
				<div class="link link-c optional" aria-hidden="true">
					<svg viewBox="0 0 100 100" preserveAspectRatio="none">
						<path d="M0 50 H96" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" />
					</svg>
				</div>

				<div class="row row-a">
					<p class="row-who">Анна · полка 90 см</p>
					<StatusStamp status="us" size="sm" />
					<p class="row-step">Перезвонить и назвать цену <span>сегодня</span></p>
					<p class="row-note">Звонок — та же задача: строка одна</p>
				</div>
				<div class="row row-b optional">
					<p class="row-who">Сергей · полка 120 см</p>
					<StatusStamp status="client" size="sm" />
					<p class="row-step">Напомнить о расчёте <span>в среду</span></p>
				</div>
				<div class="row row-c optional">
					<p class="row-who">Дмитрий · стеллаж</p>
					<StatusStamp status="closed" size="sm" />
					<p class="row-step">Строку не удаляем</p>
				</div>
			</div>
			<p class="schema-foot">
				Ничего не подключается к мессенджерам и это не CRM: таблицу ведут в Google Таблицах, Excel или на
				бумаге.
			</p>
		</figure>
	</section>

	<section class="s-wrap result" aria-labelledby="result-title">
		<div class="result-intro">
			<p class="s-eyebrow">Что останется после полного разбора</p>
			<h2 id="result-title">Лист утреннего разбора</h2>
			<p class="sample-note">
				<strong>Это образец</strong> — так выглядит лист после разбора всех шести обращений учебной недели. Свой
				лист вы получите в конце пробного разбора: с разбором своих ошибок, печатью и файлами.
			</p>
			<ol class="annot">
				<li><span class="num">1</span><b>План на день.</b> Что сделать сегодня и кому когда напомнить.</li>
				<li><span class="num">2</span><b>Таблица задач.</b> Шесть обращений — шесть задач, у каждой чей ход и следующий шаг.</li>
				<li><span class="num">3</span><b>Правила разбора.</b> Те же четыре правила — для вашей недели.</li>
			</ol>
			<p class="annot-after">К листу прилагаются итоговая таблица и пустой шаблон для своей недели в CSV.</p>
		</div>
		<WorkSheet rows={FINAL_ROWS} sample />
	</section>

	<section class="s-wrap entries" aria-labelledby="start">
		<h2 id="start">Два способа начать</h2>
		<div class="entry-grid">
			<article class="entry entry--self">
				<p class="entry-kind">Сами, прямо сейчас</p>
				<h3>Пробный разбор</h3>
				<p class="entry-meta">около 6 минут (оценка) · без регистрации</p>
				<p>
					Учебная неделя мастерской «Северная полка»: шесть обращений. В каждом решаете, чей сейчас ход и что
					делать дальше, — и сразу видите, почему так.
				</p>
				<div class="entry-result">
					<p class="result-title">Что унесёте</p>
					<ul class="takeaways">
						<li>Лист с планом на день</li>
						<li>Четыре правила разбора</li>
						<li>Шаблон таблицы для своей недели</li>
					</ul>
				</div>
				<a class="s-btn entry-cta" href={page('/razbor')}>Начать пробный разбор</a>
			</article>

			<article class="entry entry--group">
				<p class="entry-kind">С ведущим, в группе</p>
				<h3>Практикум</h3>
				<p class="entry-meta">40 минут · онлайн · группа из 8 человек</p>
				<p>
					Разберите <strong>свои</strong> обращения вместе с ведущим. Дату предложим, когда группа соберётся.
				</p>
				<div class="entry-result">
					<p class="result-title">Как проходят 40 минут</p>
					<Timeline />
					<ul class="takeaways">
						<li>Таблица своей недели</li>
						<li>План на завтра</li>
						<li>Свой регламент: когда отвечать и напоминать</li>
					</ul>
				</div>
				<a class="s-btn s-btn--quiet entry-cta" href={page('/praktikum')}>Подробнее о практикуме</a>
			</article>
		</div>
		<p class="hint">
			Не знаете, с чего начать? Пробный разбор полезен сам по себе. Практикум нужен, когда захотите применить
			правила к своим обращениям с помощью ведущего.
		</p>
	</section>
</Shell>

<style>
	h1 {
		margin: 0 0 1rem;
		font-family: var(--serif);
		font-weight: 600;
		font-size: clamp(2.2rem, 5vw, 3.7rem);
		line-height: 1.02;
		letter-spacing: -0.025em;
		text-wrap: balance;
	}

	h2 {
		margin: 0 0 1rem;
		font-family: var(--serif);
		font-size: clamp(1.6rem, 3vw, 2.2rem);
		letter-spacing: -0.02em;
	}

	.hero {
		display: grid;
		gap: 2rem;
		padding: 2rem 0 2.5rem;
	}

	.hero > *,
	.result > * {
		min-width: 0;
	}

	.lede {
		max-width: 34rem;
		margin: 0 0 0.8rem;
		font-size: 1.12rem;
		line-height: 1.5;
	}

	.offer {
		max-width: 34rem;
		margin: 1.1rem 0 0;
		padding-left: 0.8rem;
		border-left: 4px solid var(--s-us);
		font-family: var(--serif);
		font-size: 1.25rem;
		line-height: 1.3;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
		margin-top: 1.3rem;
	}

	.hero-note {
		max-width: 34rem;
		margin: 0.9rem 0 0;
		color: var(--s-muted);
		font-size: 0.92rem;
	}


	/* Схема ручного разбора */

	.schema {
		margin: 0;
		padding: 1rem;
		background: #ece5d8;
		border-radius: calc(var(--s-radius) + 6px);
	}

	.schema-cap {
		display: grid;
		gap: 0.15rem;
		margin-bottom: 0.8rem;
	}

	.cap-title {
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--s-ink);
	}

	.cap-sub {
		font-size: 0.92rem;
		color: var(--s-muted);
	}

	.schema-cols {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 3rem minmax(0, 1fr);
		gap: 0.5rem;
		margin-bottom: 0.4rem;
		font-size: 0.74rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--s-muted);
	}

	.schema-cols span:last-child {
		grid-column: 3;
	}

	.schema-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 3rem minmax(0, 1fr);
		grid-template-rows: repeat(4, auto);
		gap: 0.6rem 0.5rem;
		align-items: stretch;
	}

	.in-1 { grid-area: 1 / 1; }
	.in-2 { grid-area: 2 / 1; }
	.in-3 { grid-area: 3 / 1; }
	.in-4 { grid-area: 4 / 1; }
	.link-a { grid-area: 1 / 2 / 3 / 3; }
	.link-b { grid-area: 3 / 2; }
	.link-c { grid-area: 4 / 2; }
	.row-a { grid-area: 1 / 3 / 3 / 4; }
	.row-b { grid-area: 3 / 3; }
	.row-c { grid-area: 4 / 3; }

	.link {
		position: relative;
		color: var(--s-line);
	}

	.link svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.link::after {
		content: '';
		position: absolute;
		right: 0;
		top: 50%;
		translate: 0 -50%;
		border: 6px solid transparent;
		border-left: 8px solid var(--s-line);
		border-right: 0;
	}

	.row {
		align-self: center;
		display: grid;
		gap: 0.35rem;
		justify-items: start;
		padding: 0.7rem 0.8rem;
		background: var(--s-card);
		border: 1px solid var(--s-rule);
		border-left: 4px solid var(--s-ink);
		border-radius: 6px;
	}

	.row p {
		margin: 0;
	}

	.row-who {
		font-weight: 600;
		font-size: 0.95rem;
	}

	.row-step {
		font-size: 0.9rem;
	}

	.row-step span {
		font-weight: 600;
		white-space: nowrap;
	}

	.row-step span::before {
		content: '· ';
		font-weight: 400;
	}

	.row-note {
		font-size: 0.8rem;
		color: var(--s-muted);
	}

	.row-a {
		border-left-color: var(--s-us);
	}

	.row-b {
		border-left-color: var(--s-client);
	}

	.row-c {
		border-left-color: var(--s-closed);
	}

	.schema-foot {
		margin: 0.8rem 0 0;
		font-size: 0.86rem;
		color: var(--s-muted);
	}

	/* Образец результата */

	.result {
		display: grid;
		gap: 1.5rem;
		padding: 2.2rem 0;
		border-top: 1px solid var(--s-rule);
	}

	.sample-note {
		max-width: 36rem;
		margin: 0 0 1rem;
		padding: 0.7rem 0.9rem;
		border: 1.5px dashed var(--s-line);
		border-radius: var(--s-radius);
		font-size: 0.95rem;
	}

	.annot {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.6rem;
		max-width: 34rem;
	}

	.annot li {
		position: relative;
		padding-left: 2rem;
	}

	.num {
		position: absolute;
		left: 0;
		top: 0.05rem;
		display: grid;
		place-items: center;
		width: 1.4rem;
		height: 1.4rem;
		border-radius: 50%;
		background: var(--s-ink);
		color: #fff;
		font-size: 0.78rem;
		font-weight: 700;
	}

	.annot-after {
		margin: 0.8rem 0 0;
		color: var(--s-muted);
		font-size: 0.92rem;
	}

	/* Входы */

	.entries {
		padding-top: 2rem;
		border-top: 1px solid var(--s-rule);
	}

	.entry-grid {
		display: grid;
		gap: 1.2rem;
	}

	.entry {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1.4rem 1.3rem;
		background: var(--s-card);
		border: 1px solid var(--s-rule);
		border-radius: calc(var(--s-radius) + 4px);
		min-width: 0;
	}

	.entry--self {
		border-top: 5px solid var(--s-us);
	}

	.entry--group {
		border-top: 5px solid var(--s-client);
	}

	.entry p {
		margin: 0;
	}

	.entry-kind,
	.result-title {
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--s-muted);
	}

	h3 {
		margin: 0;
		font-family: var(--serif);
		font-size: 1.85rem;
		line-height: 1.1;
		letter-spacing: -0.015em;
	}

	.entry-meta {
		font-weight: 600;
		color: var(--s-muted);
	}


	.entry-result {
		display: grid;
		gap: 0.7rem;
		margin: 0.6rem 0 0.4rem;
		padding-top: 0.9rem;
		border-top: 1px dashed var(--s-rule);
	}

	.takeaways {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.25rem;
	}

	.takeaways li::before {
		content: '→ ';
		color: var(--s-muted);
	}

	.entry-cta {
		align-self: flex-start;
		margin-top: auto;
	}

	.hint {
		max-width: 46rem;
		margin: 1.2rem 0 0;
		color: var(--s-muted);
	}

	@media (min-width: 1000px) {
		.hero {
			grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
			align-items: center;
			gap: 3rem;
			padding: 2.4rem 0 3rem;
		}

		.result {
			grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
			align-items: start;
			gap: 3rem;
			padding: 3rem 0;
		}

		.entry-grid {
			grid-template-columns: 1fr 1fr;
		}

		.entry {
			padding: 1.6rem;
		}
	}

	@media (max-width: 699px) {
		.optional {
			display: none;
		}

		.hero {
			gap: 1.6rem;
			padding: 1.2rem 0 1.8rem;
		}

		.lede {
			font-size: 1.04rem;
		}

		.offer {
			font-size: 1.12rem;
		}

		.hero-actions .s-btn {
			flex: 1 1 100%;
		}

		.schema-cols {
			display: none;
		}

		.schema-grid {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: none;
		}

		.in-1,
		.in-2,
		.link-a,
		.row-a {
			grid-area: auto;
		}

		.link-a {
			height: 1.6rem;
			width: 2.4rem;
			justify-self: center;
		}

		.link-a svg {
			display: none;
		}

		.link-a::after {
			left: 50%;
			right: auto;
			top: auto;
			bottom: 0;
			translate: -50% 0;
			border: 8px solid transparent;
			border-top: 10px solid var(--s-line);
			border-bottom: 0;
		}

		.link-a::before {
			content: '';
			position: absolute;
			left: 50%;
			top: 0;
			bottom: 8px;
			border-left: 2px solid var(--s-line);
		}

		.row-a {
			align-self: stretch;
		}
	}
</style>
