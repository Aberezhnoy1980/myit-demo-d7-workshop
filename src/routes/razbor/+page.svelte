<script lang="ts">
	import { tick } from 'svelte';
	import { page } from '#lib/page';
	import Shell from '#lib/stroka/Shell.svelte';
	import ChannelCard from '#lib/stroka/ChannelCard.svelte';
	import RulesPanel from '#lib/stroka/RulesPanel.svelte';
	import StatusStamp from '#lib/stroka/StatusStamp.svelte';
	import WorkSheet from '#lib/stroka/WorkSheet.svelte';
	import WorkTable from '#lib/stroka/WorkTable.svelte';
	import { CASES, type Option } from '#lib/trainer/cases';
	import {
		TOTAL_QUESTIONS,
		answer,
		currentCase,
		currentQuestion,
		findOption,
		next,
		questionNumber,
		results,
		start,
		type TrainerState
	} from '#lib/trainer/engine';
	import { countPlan } from '#lib/trainer/model';
	import { TASKS_CSV_NAME, TEMPLATE_CSV_NAME, tasksCsv, templateCsv } from '#lib/trainer/csv';

	// Всё состояние разбора — только в памяти страницы. Хранилища браузера не используются.
	type View = 'intro' | 'step' | 'result' | 'errors';
	type RegKey = 'answer' | 'remind' | 'visits' | 'time';

	const REG_FIELDS: { key: RegKey; label: string; hint: string }[] = [
		{ key: 'answer', label: 'На новый вопрос клиента отвечаю', hint: 'например, в тот же день' },
		{ key: 'remind', label: 'Если жду клиента, напоминаю через', hint: 'например, 2 рабочих дня' },
		{ key: 'visits', label: 'Замеры, встречи, выезды', hint: 'например, по вторникам' },
		{ key: 'time', label: 'Разбор делаю каждый день в', hint: 'например, 9:00' }
	];
	const emptyReg = (): Record<RegKey, string> => ({ answer: '', remind: '', visits: '', time: '' });

	let view = $state<View>('intro');
	let st = $state<TrainerState>(start());
	let chosen = $state<Option | null>(null);
	let reg = $state(emptyReg());

	let introTitleEl = $state<HTMLElement | null>(null);
	let progressEl = $state<HTMLElement | null>(null);
	let qHeadEl = $state<HTMLElement | null>(null);
	let optsEl = $state<HTMLElement | null>(null);
	let feedbackEl = $state<HTMLElement | null>(null);
	let resultTitleEl = $state<HTMLElement | null>(null);
	let errorsTitleEl = $state<HTMLElement | null>(null);

	const kase = $derived(st.finished ? null : currentCase(st));
	const question = $derived(st.finished ? null : currentQuestion(st));
	const solved = $derived(st.solved);
	const counts = $derived(countPlan(st.rows));
	const res = $derived(results(st));
	const beforeMap = $derived(new Map(st.caseStartRows.map((row) => [row.id, row])));
	const focusRows = $derived(kase ? st.rows.filter((row) => kase.focus.includes(row.id)) : []);
	const contextRow = $derived(kase ? st.caseStartRows.find((row) => kase.focus.includes(row.id)) : undefined);
	const isLastInCase = $derived(kase ? st.questionIndex === kase.questions.length - 1 : false);
	const isLastCase = $derived(st.caseIndex === CASES.length - 1);
	const topRule = $derived.by(() => {
		const sorted = [...res.byRule].sort((a, b) => b.count - a.count);
		return sorted[0].count >= 2 && sorted[0].count > sorted[1].count ? sorted[0] : null;
	});
	const footnote = $derived(
		`Верно с первого ответа: ${res.firstCorrect} из ${res.total}.` +
			(res.mistakes.length ? ' Разбор ошибок — отдельной печатью.' : '')
	);

	async function focusLater(get: () => HTMLElement | null): Promise<void> {
		await tick();
		get()?.focus();
	}

	function begin(): void {
		st = start();
		chosen = null;
		view = 'step';
		focusLater(() => progressEl);
	}

	function choose(optionId: string): void {
		if (!question || solved) return;
		st = answer(st, optionId);
		chosen = findOption(question, optionId);
		focusLater(() => feedbackEl);
	}

	function retry(): void {
		chosen = null;
		focusLater(() => optsEl?.querySelector<HTMLButtonElement>('.opt:not(.tried)') ?? null);
	}

	function goNext(): void {
		const caseBefore = st.caseIndex;
		st = next(st);
		chosen = null;
		if (st.finished) {
			view = 'result';
			window.scrollTo({ top: 0 });
			focusLater(() => resultTitleEl);
		} else if (st.caseIndex !== caseBefore) {
			focusLater(() => progressEl);
		} else {
			focusLater(() => qHeadEl);
		}
	}

	function restart(): void {
		st = start();
		chosen = null;
		reg = emptyReg();
		view = 'intro';
		window.scrollTo({ top: 0 });
		focusLater(() => introTitleEl);
	}

	function openErrors(): void {
		view = 'errors';
		window.scrollTo({ top: 0 });
		focusLater(() => errorsTitleEl);
	}

	function backToResult(): void {
		view = 'result';
		window.scrollTo({ top: 0 });
		focusLater(() => resultTitleEl);
	}

	function download(name: string, text: string): void {
		const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = name;
		document.body.append(link);
		link.click();
		link.remove();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
</script>

<svelte:head>
	<title>Пробный разбор — Строка</title>
	<meta
		name="description"
		content="Пробный разбор шести обращений учебной недели мастерской: чей ход и следующий шаг. В конце — лист с планом на день, разбор ошибок и шаблон таблицы."
	/>
</svelte:head>

<Shell current="razbor">
	{#if view === 'intro'}
		<section class="s-wrap intro" aria-labelledby="intro-title">
			<div class="intro-main">
				<p class="s-eyebrow">Пробный разбор</p>
				<h1 id="intro-title" bind:this={introTitleEl} tabindex="-1">Шесть обращений — один план на утро</h1>
				<p class="intro-lede">
					Сейчас понедельник, 9:00. Вы — мастер небольшой мастерской «Северная полка»: делаете полки, стеллажи
					и мелкие изделия из дерева. В прошлый понедельник вы завели таблицу обращений и записали в неё две
					задачи. Потом неделя ушла в работу, и в таблицу никто не заглядывал. За это время пришли письма и
					сообщения, а сегодня утром — звонок. Разберите всё, что накопилось, и выйдите с планом на день.
				</p>
				<div class="intro-now">
					<p>
						<b>Шесть обращений, {TOTAL_QUESTIONS} вопросов</b> — около 6 минут (оценка, не замер). В каждом
						обращении один–три вопроса. Если ответ неверный, вы увидите почему и выберете ещё раз. Таблица
						заполняется по ходу; правила и регламент можно открыть на любом шаге.
					</p>
					<p class="intro-warn">
						Прогресс не сохраняется: если закрыть или перезагрузить страницу, разбор начнётся заново.
					</p>
				</div>
				<div class="intro-actions">
					<button type="button" class="s-btn" onclick={begin}>Начать разбор</button>
					<a class="s-btn s-btn--quiet" href={page('/')}>На главную</a>
				</div>
				<noscript><p class="intro-now">Для разбора нужен JavaScript.</p></noscript>
			</div>
			<aside class="intro-rules" aria-label="Правила и регламент">
				<RulesPanel />
			</aside>
		</section>
	{:else if view === 'step' && kase && question}
		<div class="s-wrap progress">
			<p class="progress-label" bind:this={progressEl} tabindex="-1">
				<span class="s-eyebrow">Пробный разбор</span>
				<span class="progress-text">Обращение {st.caseIndex + 1} из {CASES.length}</span>
				<span class="progress-case">{kase.title}</span>
			</p>
			<ol class="dots" aria-hidden="true">
				{#each CASES as item, i (item.id)}
					<li class:done={i < st.caseIndex} class:now={i === st.caseIndex}></li>
				{/each}
			</ol>
			<details class="rules">
				<summary>Правила и регламент</summary>
				<div class="rules-body">
					<RulesPanel headingLevel={3} />
				</div>
			</details>
		</div>

		<div class="s-wrap stage">
			<div class="work">
				<section class="happened" aria-labelledby="happened-title">
					<h2 id="happened-title" class="s-eyebrow">Что произошло</h2>
					<ChannelCard channel={kase.channel} who={kase.who} messages={kase.messages} />
					{#if kase.note}
						<p class="context">{kase.note}</p>
					{/if}
					{#if contextRow}
						<p class="context">
							<span>Было в таблице:</span>
							<StatusStamp status={contextRow.status} size="sm" />
							<span>«{contextRow.step}»{contextRow.when !== '—' ? ` · ${contextRow.when}` : ''}</span>
						</p>
					{/if}
				</section>

				<section class="ask" aria-labelledby="q-title">
					<div class="q-head" bind:this={qHeadEl} tabindex="-1">
						<p class="s-eyebrow">
							Вопрос {st.questionIndex + 1} из {kase.questions.length} · {questionNumber(st)} из {TOTAL_QUESTIONS} всего
						</p>
						<h2 id="q-title">{question.prompt}</h2>
					</div>

					<div
						class="opts"
						class:status-opts={question.options.some((o) => o.status)}
						role="group"
						aria-labelledby="q-title"
						bind:this={optsEl}
					>
						{#each question.options as option (option.id)}
							{@const isChosen = chosen?.id === option.id}
							{@const wasTried = st.tried.includes(option.id) && !option.correct}
							<button
								type="button"
								class="opt"
								class:tried={wasTried}
								class:right={isChosen && option.correct}
								class:wrong={isChosen && !option.correct}
								aria-pressed={isChosen}
								aria-label={option.label}
								disabled={solved && !isChosen}
								onclick={() => choose(option.id)}
							>
								{#if option.status}
									<StatusStamp status={option.status} />
								{/if}
								<span class="opt-label">{option.short ?? option.label}</span>
								{#if wasTried}
									<span class="mark" aria-hidden="true">✗</span>
								{:else if isChosen && option.correct}
									<span class="mark" aria-hidden="true">✓</span>
								{/if}
							</button>
						{/each}
					</div>

					<div class="feedback-slot" aria-live="polite">
						{#if chosen}
							<div class="feedback" class:good={chosen.correct} class:bad={!chosen.correct} bind:this={feedbackEl} tabindex="-1">
								<p class="verdict">{chosen.correct ? 'Верно' : 'Неверно'}</p>
								<p>{chosen.feedback}</p>
								<p class="rule">{chosen.rule}</p>
								{#if chosen.correct}
									<p class="changed"><span>В таблице:</span> {question.change}</p>
								{/if}
							</div>
						{/if}
					</div>

					<div class="ask-actions">
						{#if chosen && !chosen.correct}
							<button type="button" class="s-btn s-btn--quiet" onclick={retry}>Выбрать ещё раз</button>
						{:else if solved}
							<button type="button" class="s-btn" onclick={goNext}>
								{!isLastInCase ? 'Следующий вопрос' : !isLastCase ? 'К следующему обращению' : 'Посмотреть итог'}
							</button>
						{/if}
					</div>

					<aside class="consider" aria-label="Что учесть">
						<p class="s-eyebrow">Что учесть</p>
						<ul>
							{#each question.consider as line, i (i)}
								<li>{line}</li>
							{/each}
						</ul>
					</aside>
				</section>
			</div>

			<section class="board" aria-labelledby="board-title">
				<div class="board-head">
					<h2 id="board-title">Рабочая таблица</h2>
					<ul class="counts" aria-label="План на день">
						<li><b>{counts.today}</b> сегодня</li>
						<li><b>{counts.wednesday}</b> в среду</li>
						<li><b>{counts.closed}</b> закрыто</li>
						<li class="muted"><b>{counts.pending}</b> ждут разбора</li>
					</ul>
				</div>

				<div class="row-cards" aria-hidden="true">
					{#each focusRows as row (row.id)}
						{@const was = beforeMap.get(row.id)}
						<div class="row-card">
							<p class="row-card-who">{row.who} · {row.task}{#if !was}<span class="new-tag">новая строка</span>{/if}</p>
							<div class="row-card-status">
								{#if was && was.status !== row.status}
									<span class="was"><StatusStamp status={was.status} size="sm" /></span>
									<span>→</span>
								{/if}
								<StatusStamp status={row.status} size="sm" />
							</div>
							<p class="row-card-step">{row.step}{row.when !== '—' ? ' · ' : ''}<b>{row.when !== '—' ? row.when : ''}</b></p>
						</div>
					{/each}
				</div>

				<details class="table-toggle">
					<summary>Вся таблица · строк: {st.rows.length}</summary>
					<WorkTable rows={st.rows} focus={kase.focus} before={st.caseStartRows} />
				</details>
				<div class="table-wide">
					<WorkTable rows={st.rows} focus={kase.focus} before={st.caseStartRows} />
				</div>
			</section>
		</div>
	{:else if view === 'result'}
		<section class="s-wrap result" aria-labelledby="result-title">
			<div class="result-head no-print">
				<p class="s-eyebrow">Разбор готов</p>
				<h1 id="result-title" bind:this={resultTitleEl} tabindex="-1">
					{counts.today} дела на сегодня, {counts.wednesday} — на среду
				</h1>
				<p class="result-lede">
					Шесть обращений — шесть задач, одна из них закрыта. Верно с первого ответа:
					<b>{res.firstCorrect} из {res.total}</b>.
				</p>
				<div class="result-actions">
					<button type="button" class="s-btn" onclick={() => window.print()}>Распечатать лист</button>
					<button type="button" class="s-btn s-btn--quiet" onclick={openErrors}>
						{res.mistakes.length ? `Разбор ошибок · ${res.mistakes.length}` : 'Разбор ошибок · ошибок нет'}
					</button>
				</div>
				<p class="result-hint">
					Печать — через окно печати браузера; там же можно сохранить лист в PDF. Кнопки и навигация не
					печатаются.
				</p>
			</div>

			<WorkSheet rows={st.rows} {footnote}>
				{#snippet regulation()}
					<p class="reg-note no-print">
						Необязательно. Впишите свои сроки — они попадут в печать. Значения остаются только на этой странице и
						пропадут после перезагрузки.
					</p>
					<div class="reg-fields">
						{#each REG_FIELDS as field (field.key)}
							<div class="reg-field">
								<label for="reg-{field.key}">{field.label}</label>
								<input
									id="reg-{field.key}"
									class="no-print"
									type="text"
									autocomplete="off"
									maxlength="60"
									placeholder={field.hint}
									bind:value={reg[field.key]}
								/>
								<span class="print-only reg-print">{reg[field.key].trim() || ' '}</span>
							</div>
						{/each}
					</div>
				{/snippet}
			</WorkSheet>

			<section class="materials no-print" aria-labelledby="materials-title">
				<h2 id="materials-title">Материалы</h2>
				<div class="mat-grid">
					<div class="mat">
						<p class="mat-title">Итоговая таблица</p>
						<p>Шесть задач учебной недели — те же строки, что в листе. Открывается в Google Таблицах и Excel.</p>
						<button type="button" class="s-btn s-btn--quiet" onclick={() => download(TASKS_CSV_NAME, tasksCsv(st.rows))}>
							Скачать таблицу (CSV)
						</button>
					</div>
					<div class="mat">
						<p class="mat-title">Шаблон на свою неделю</p>
						<p>Те же шесть колонок, строка-пример и десять пустых строк для своих обращений.</p>
						<button type="button" class="s-btn s-btn--quiet" onclick={() => download(TEMPLATE_CSV_NAME, templateCsv())}>
							Скачать шаблон (CSV)
						</button>
					</div>
				</div>
				<h3>Как применить на своей неделе</h3>
				<ol class="apply">
					<li>Откройте шаблон в Google Таблицах, Excel или распечатайте.</li>
					<li>Пройдите все каналы за последние три дня и заведите строку на каждую задачу.</li>
					<li>Впишите свой регламент: когда отвечаете, когда напоминаете, когда выезжаете.</li>
					<li>Завтра утром начните с таблицы, а не с чатов.</li>
				</ol>
				<p class="honest">
					Это учебная неделя: таблица одинакова у всех, кто проходит разбор. Ваше — первые ответы и регламент.
				</p>
			</section>

			<section class="after no-print" aria-label="Что дальше">
				<div class="after-card">
					<p class="mat-title">Разобрать свои обращения с ведущим</p>
					<p>Практикум на 40 минут: те же правила на ваших переписках, спорные задачи и ваш регламент.</p>
					<a class="s-btn" href={page('/praktikum')}>О практикуме с ведущим</a>
				</div>
				<div class="after-card">
					<p class="mat-title">Пройти разбор заново</p>
					<p>Ответы, ошибки и вписанный регламент будут сброшены.</p>
					<button type="button" class="s-btn s-btn--quiet" onclick={restart}>Начать заново</button>
				</div>
			</section>
		</section>
	{:else if view === 'errors'}
		<section class="s-wrap errors" aria-labelledby="errors-title">
			<p class="print-only print-head">Утренний разбор · мастерская «Северная полка» · разбор ошибок</p>
			<p class="s-eyebrow no-print">Пробный разбор</p>
			<h1 id="errors-title" bind:this={errorsTitleEl} tabindex="-1">Разбор ошибок</h1>

			{#if res.mistakes.length === 0}
				<p class="errors-lede">С первого ответа — все {res.total} решений.</p>
				<p>
					Правила работают у вас уже на учебной неделе. Проверьте их на своей: откройте шаблон и разберите
					обращения за последние три дня.
				</p>
				<div class="errors-actions no-print">
					<button type="button" class="s-btn" onclick={() => download(TEMPLATE_CSV_NAME, templateCsv())}>Скачать шаблон (CSV)</button>
					<button type="button" class="s-btn s-btn--quiet" onclick={backToResult}>Вернуться к листу</button>
				</div>
			{:else}
				<p class="errors-lede">
					С первого ответа — {res.firstCorrect} из {res.total}. Ошибкой считается неверный первый ответ; повторные
					попытки в том же вопросе не добавляют ошибок.
				</p>
				{#if topRule}
					<p>
						Больше всего ошибок — по правилу «{topRule.rule.replace(/^Правило \d · /, '')}»: {topRule.count} из
						{res.mistakes.length}. Срок и статус выводятся из фактов переписки и регламента — их можно перечитать в
						правилах.
					</p>
				{/if}
				<table class="by-rule">
					<caption class="sr-only">Ошибки по правилам</caption>
					<thead><tr><th scope="col">Правило</th><th scope="col">Ошибок</th></tr></thead>
					<tbody>
						{#each res.byRule as item (item.rule)}
							<tr><th scope="row">{item.rule}</th><td>{item.count}</td></tr>
						{/each}
					</tbody>
				</table>

				<ol class="mistakes">
					{#each res.mistakes as m (m.question.id)}
						<li class="mistake">
							<p class="m-title">{m.caseTitle} — {m.question.prompt.toLowerCase()}</p>
							<p><span class="m-label">Ваш первый ответ:</span> <span class="m-bad">«{m.first.label}»</span></p>
							<p><span class="m-label">Верно:</span> <span class="m-good">«{m.correct.label}»</span></p>
							<p>{m.first.feedback}</p>
							<p class="rule">{m.question.rule}</p>
						</li>
					{/each}
				</ol>

				<div class="errors-actions no-print">
					<button type="button" class="s-btn" onclick={() => window.print()}>Распечатать разбор ошибок</button>
					<button type="button" class="s-btn s-btn--quiet" onclick={backToResult}>Вернуться к листу</button>
					<button type="button" class="s-btn s-btn--quiet" onclick={restart}>Пройти разбор заново</button>
				</div>
			{/if}
		</section>
	{/if}
</Shell>

<style>
	h1 {
		margin: 0 0 0.9rem;
		font-family: var(--serif);
		font-weight: 600;
		font-size: clamp(2rem, 4.4vw, 3.2rem);
		line-height: 1.05;
		letter-spacing: -0.025em;
		text-wrap: balance;
	}

	h1:focus-visible {
		outline-offset: 2px;
	}

	.q-head:focus-visible,
	.progress-label:focus-visible {
		outline-offset: 6px;
	}

	h2 {
		margin: 0;
	}

	/* Вступление */

	.intro {
		display: grid;
		gap: 1.6rem;
		padding: 1.6rem 0 1rem;
	}

	.intro > * {
		min-width: 0;
	}

	.intro-lede {
		max-width: 38rem;
		margin: 0 0 1rem;
		font-size: 1.08rem;
		line-height: 1.5;
	}

	.intro-now {
		max-width: 38rem;
		margin: 0;
		padding: 0.85rem 1rem;
		border: 1.5px dashed var(--s-line);
		border-radius: var(--s-radius);
		background: var(--s-card);
	}

	.intro-now p {
		margin: 0;
	}

	.intro-warn {
		margin-top: 0.5rem !important;
		font-weight: 600;
	}

	.intro-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
		margin-top: 1.2rem;
	}

	.intro-rules {
		padding: 1.1rem 1.2rem;
		background: var(--s-card);
		border: 1px solid var(--s-rule);
		border-radius: calc(var(--s-radius) + 4px);
	}

	/* Шаг */

	.progress {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1.2rem;
		padding: 0.7rem 0 0.2rem;
	}

	.progress-label {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.6rem;
		margin: 0;
	}

	.progress-label .s-eyebrow {
		margin: 0;
	}

	.progress-text {
		font-weight: 600;
	}

	.progress-case {
		color: var(--s-muted);
	}

	.dots {
		display: flex;
		gap: 4px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.dots li {
		width: 1.6rem;
		height: 6px;
		border-radius: 3px;
		background: var(--s-rule);
	}

	.dots li.done {
		background: var(--s-ink);
	}

	.dots li.now {
		background: linear-gradient(90deg, var(--s-ink) 50%, var(--s-rule) 50%);
	}

	.rules {
		margin-left: auto;
		position: relative;
	}

	.rules summary {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 0.9rem;
		border: 1.5px solid var(--s-ink);
		border-radius: 999px;
		font-weight: 600;
		font-size: 0.92rem;
		cursor: pointer;
		list-style: none;
	}

	.rules summary::-webkit-details-marker,
	.table-toggle summary::-webkit-details-marker {
		display: none;
	}

	.rules summary::after,
	.table-toggle summary::after {
		content: '＋';
		margin-left: 0.45rem;
	}

	.rules[open] summary::after,
	.table-toggle[open] summary::after {
		content: '－';
	}

	.rules-body {
		position: absolute;
		right: 0;
		top: calc(100% + 0.5rem);
		z-index: 5;
		width: min(32rem, calc(100vw - 2rem));
		max-height: 70vh;
		overflow: auto;
		padding: 1rem 1.1rem;
		background: var(--s-card);
		border: 1px solid var(--s-rule);
		border-radius: var(--s-radius);
		box-shadow: 0 18px 40px -18px rgba(28, 25, 21, 0.45);
	}

	.stage {
		display: grid;
		gap: 1.6rem;
		padding-top: 0.8rem;
	}

	.stage > * {
		min-width: 0;
	}

	.work {
		display: grid;
		gap: 1.4rem;
		align-content: start;
	}

	.happened {
		display: grid;
		gap: 0.6rem;
	}

	.context {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem 0.5rem;
		margin: 0;
		font-size: 0.88rem;
		color: var(--s-muted);
	}

	.ask {
		display: grid;
		gap: 0.9rem;
		padding: 1.2rem;
		background: var(--s-card);
		border: 1.5px solid var(--s-ink);
		border-radius: calc(var(--s-radius) + 4px);
	}

	.q-head p {
		margin: 0 0 0.25rem;
	}

	.q-head h2 {
		font-family: var(--serif);
		font-size: clamp(1.6rem, 3.2vw, 2.1rem);
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	.opts {
		display: grid;
		gap: 0.55rem;
	}

	.opt {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		width: 100%;
		min-height: 52px;
		padding: 0.65rem 0.9rem;
		background: var(--s-paper);
		border: 1.5px solid var(--s-line);
		border-radius: var(--s-radius);
		color: var(--s-ink);
		font: 600 1rem/1.3 var(--sans);
		text-align: left;
		cursor: pointer;
		transition: border-color 150ms ease, background-color 150ms ease;
	}

	.opt:hover:not(:disabled) {
		border-color: var(--s-ink);
		background: #fff;
	}

	.opt:disabled {
		cursor: default;
		opacity: 0.45;
	}

	.opt-label {
		flex: 1;
	}

	.status-opts .opt-label {
		font-weight: 400;
		color: var(--s-muted);
	}

	.mark {
		flex: none;
		font-size: 1.15rem;
		font-weight: 700;
	}

	.opt.tried {
		border-style: dashed;
		background: transparent;
	}

	.opt.tried .mark,
	.opt.wrong .mark {
		color: var(--s-bad);
	}

	.opt.wrong {
		border-color: var(--s-bad);
		border-style: solid;
		background: var(--s-bad-bg);
	}

	.opt.right {
		border-color: var(--s-good);
		background: var(--s-good-bg);
	}

	.opt.right .mark {
		color: var(--s-good);
	}

	.feedback-slot:empty,
	.ask-actions:empty {
		display: none;
	}

	.feedback {
		padding: 0.85rem 1rem;
		border-radius: var(--s-radius);
		border-left: 5px solid;
	}

	.feedback p {
		margin: 0 0 0.4rem;
	}

	.feedback p:last-child {
		margin-bottom: 0;
	}

	.feedback.good {
		background: var(--s-good-bg);
		border-color: var(--s-good);
	}

	.feedback.bad {
		background: var(--s-bad-bg);
		border-color: var(--s-bad);
	}

	.verdict {
		font-weight: 700;
		font-size: 1.05rem;
	}

	.good .verdict {
		color: var(--s-good);
	}

	.bad .verdict {
		color: var(--s-bad);
	}

	.rule {
		display: inline-block;
		padding: 0.1rem 0.5rem;
		border: 1px solid currentColor;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--s-muted);
	}

	.changed {
		font-weight: 600;
	}

	.changed span {
		font-weight: 400;
		color: var(--s-muted);
	}

	.consider {
		margin: 0;
		padding: 0.75rem 0.9rem;
		background: #f1ebdf;
		border-radius: var(--s-radius);
		font-size: 0.9rem;
	}

	.consider .s-eyebrow {
		margin-bottom: 0.3rem;
	}

	.consider ul {
		margin: 0;
		padding-left: 1.1rem;
		display: grid;
		gap: 0.25rem;
	}

	.board {
		align-self: start;
	}

	.board-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.4rem 1rem;
		margin-bottom: 0.7rem;
	}

	.board-head h2 {
		font-family: var(--serif);
		font-size: 1.4rem;
	}

	.counts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 0.9rem;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 0.88rem;
	}

	.counts b {
		font-family: var(--serif);
		font-size: 1.15rem;
	}

	.counts .muted {
		color: var(--s-muted);
	}

	.row-cards {
		display: grid;
		gap: 0.5rem;
		margin-bottom: 0.6rem;
	}

	.row-card {
		display: grid;
		gap: 0.4rem;
		padding: 0.8rem 0.9rem;
		background: #fff8e5;
		border: 1px solid var(--s-rule);
		border-left: 4px solid var(--s-ink);
		border-radius: 6px;
	}

	.row-card p {
		margin: 0;
	}

	.row-card-who {
		font-weight: 600;
	}

	.new-tag {
		display: inline-block;
		margin-left: 0.4rem;
		padding: 0 0.4rem;
		border: 1px dashed var(--s-muted);
		border-radius: 4px;
		font-size: 0.72rem;
		font-weight: 400;
		color: var(--s-muted);
	}

	.row-card-status {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
	}

	.row-card .was {
		opacity: 0.55;
	}

	.table-toggle summary {
		display: flex;
		align-items: center;
		min-height: 44px;
		font-weight: 600;
		cursor: pointer;
		list-style: none;
	}

	.table-wide {
		display: none;
	}

	/* Итог */

	.result {
		display: grid;
		gap: 1.6rem;
		padding: 1.6rem 0 0.5rem;
	}

	.result > * {
		min-width: 0;
	}

	.result-head p {
		margin: 0;
	}

	.result-lede {
		max-width: 40rem;
		font-size: 1.1rem;
	}

	.result-actions,
	.errors-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
		margin-top: 1.1rem !important;
	}

	.result-hint {
		margin-top: 0.6rem !important;
		max-width: 40rem;
		color: var(--s-muted);
		font-size: 0.9rem;
	}

	.reg-note {
		margin: 0 0 0.6rem !important;
		color: var(--s-muted);
		font-size: 0.86rem;
	}

	.reg-fields {
		display: grid;
		gap: 0.7rem;
	}

	.reg-field {
		display: grid;
		gap: 0.25rem;
		min-width: 0;
	}

	.reg-field label {
		font-weight: 600;
	}

	.reg-field input {
		width: 100%;
		min-height: 44px;
		padding: 0.4rem 0.6rem;
		border: 0;
		border-bottom: 1.5px solid var(--s-ink);
		background: #fbf8f1;
		color: var(--s-ink);
		font: inherit;
	}

	.reg-field input::placeholder {
		color: #8a8178;
	}

	.materials {
		padding: 1.3rem;
		background: var(--s-card);
		border: 1px solid var(--s-rule);
		border-radius: calc(var(--s-radius) + 4px);
	}

	.materials h2 {
		margin-bottom: 0.9rem;
		font-family: var(--serif);
		font-size: 1.5rem;
	}

	.materials h3 {
		margin: 1.2rem 0 0.5rem;
		font-family: var(--serif);
		font-size: 1.2rem;
	}

	.mat-grid {
		display: grid;
		gap: 0.9rem;
	}

	.mat,
	.after-card {
		display: grid;
		gap: 0.45rem;
		justify-items: start;
		align-content: start;
		padding: 1rem;
		border: 1px solid var(--s-rule);
		border-radius: var(--s-radius);
		background: #fff;
	}

	.mat p,
	.after-card p {
		margin: 0;
	}

	.mat-title {
		font-weight: 700;
	}

	.apply {
		margin: 0;
		padding-left: 1.2rem;
		display: grid;
		gap: 0.3rem;
	}

	.honest {
		margin: 1rem 0 0;
		color: var(--s-muted);
		font-size: 0.92rem;
	}

	.after {
		display: grid;
		gap: 0.9rem;
	}

	/* Ошибки */

	.errors {
		padding: 1.6rem 0 0.5rem;
		max-width: 52rem;
	}

	.errors-lede {
		font-size: 1.1rem;
		font-weight: 600;
	}

	.by-rule {
		width: 100%;
		max-width: 30rem;
		margin: 1rem 0 1.4rem;
		border-collapse: collapse;
		font-size: 0.95rem;
	}

	.by-rule th,
	.by-rule td {
		padding: 0.4rem 0.6rem 0.4rem 0;
		border-bottom: 1px solid var(--s-rule);
		text-align: left;
	}

	.by-rule thead th {
		font-size: 0.75rem;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--s-muted);
	}

	.by-rule tbody th {
		font-weight: 400;
	}

	.by-rule td {
		width: 5rem;
		font-weight: 700;
	}

	.mistakes {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.8rem;
	}

	.mistake {
		padding: 0.9rem 1rem;
		background: var(--s-card);
		border: 1px solid var(--s-rule);
		border-left: 5px solid var(--s-bad);
		border-radius: var(--s-radius);
	}

	.mistake p {
		margin: 0 0 0.35rem;
	}

	.mistake p:last-child {
		margin-bottom: 0;
	}

	.m-title {
		font-weight: 700;
	}

	.m-label {
		color: var(--s-muted);
	}

	.m-bad {
		color: var(--s-bad);
		font-weight: 600;
	}

	.m-good {
		color: var(--s-good);
		font-weight: 600;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	@media (min-width: 760px) {
		.mat-grid,
		.after,
		.reg-fields {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (min-width: 1000px) {
		.intro {
			grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
			gap: 3rem;
			align-items: start;
			padding: 2.6rem 0 1.5rem;
		}

		.stage {
			grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
			gap: 2.5rem;
			align-items: start;
		}

		.board {
			position: sticky;
			top: 1rem;
			padding: 1.1rem 1.2rem 0.6rem;
			background: var(--s-card);
			border: 1px solid var(--s-rule);
			border-radius: calc(var(--s-radius) + 4px);
			box-shadow: var(--s-shadow);
		}

		.row-cards,
		.table-toggle {
			display: none;
		}

		.table-wide {
			display: block;
		}

		/* На компьютере условия видны до вариантов; на телефоне — сразу после, чтобы не отодвигать действия. */
		.q-head {
			order: -2;
		}

		.consider {
			order: -1;
		}

		.result {
			grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
			grid-template-rows: auto auto 1fr;
			column-gap: 2.5rem;
			align-items: start;
		}

		.result-head {
			grid-column: 1 / -1;
		}

		.result :global(.sheet) {
			grid-column: 2;
			grid-row: 2 / span 2;
		}

		.materials,
		.after {
			grid-column: 1;
			align-self: start;
		}

		.after {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 999px) {
		.rules {
			margin-left: 0;
		}

		.rules-body {
			left: 0;
			right: auto;
		}
	}

	@media (max-width: 699px) {
		.progress {
			gap: 0.4rem 0.8rem;
			padding: 0.6rem 0 0.2rem;
		}

		.progress-label .s-eyebrow,
		.progress-case {
			display: none;
		}

		.dots li {
			width: 0.9rem;
		}

		.rules summary {
			min-height: 40px;
			padding: 0 0.75rem;
			font-size: 0.85rem;
		}

		.rules {
			margin-left: auto !important;
		}

		.rules-body {
			left: auto !important;
			right: 0 !important;
		}

		.stage {
			padding-top: 0.4rem;
			gap: 1.2rem;
		}

		.work {
			gap: 1rem;
		}

		.happened > h2 {
			display: none;
		}

		.context {
			font-size: 0.82rem;
		}

		.ask {
			padding: 1rem 0.9rem;
			gap: 0.75rem;
		}

		.intro-actions .s-btn,
		.result-actions .s-btn,
		.errors-actions .s-btn {
			flex: 1 1 100%;
		}
	}

	@media print {
		.result,
		.errors {
			display: block;
			padding: 0;
			max-width: none;
		}

		.reg-fields {
			grid-template-columns: 1fr 1fr;
			gap: 8pt 18pt;
		}

		.reg-field label {
			font-size: 10.5pt;
		}

		.reg-print {
			min-height: 16pt;
			padding: 2pt 0;
			border-bottom: 1px solid #000;
			font-size: 11pt;
		}

		.print-head {
			margin: 0 0 6pt;
			font-size: 10pt;
			color: #444;
		}

		.errors h1 {
			font-size: 20pt;
			margin-bottom: 8pt;
		}

		.errors,
		.errors p,
		.by-rule {
			font-size: 10.5pt;
		}

		.mistake {
			break-inside: avoid;
			border: 1px solid #999;
			border-left: 4pt solid #8f2f1c;
			background: none;
		}
	}
</style>
