<script lang="ts">
	import { asset } from '$app/paths';
	import { page } from '#lib/page';
	import LedgerTable from '#lib/LedgerTable.svelte';
	import { LEDGER, summarize } from '#lib/ledger';
	import SiteHeader from '#lib/SiteHeader.svelte';
	import WorkbookSlip from '#lib/WorkbookSlip.svelte';

	const summary = summarize(LEDGER);
	const example = LEDGER[2];
	const exercise = [
		['демо-11', 'мессенджер', 'Можно ли полку 90 см', 'Никто ещё не ответил'],
		['демо-12', 'телефон', 'Нужна дата замера', 'Мы обещали перезвонить'],
		['демо-13', 'почта', 'Пришлите фото стены', 'Мы спросили вчера и ждём'],
		['демо-14', 'форма', 'Передумал, не нужно', 'Отказ уже ясен']
	];
</script>

<svelte:head>
	<title>Пробный урок — учёт обращений</title>
	<meta
		name="description"
		content="Пробный урок: статус и следующий шаг для обращений небольшой мастерской. Контакты не нужны."
	/>
</svelte:head>

<SiteHeader asideHref={page('/workshop')} asideLabel="К практикуму" />
<main id="content" class="frame">
	<section class="hero">
		<div class="hero-copy">
			<p class="stamp">Демонстрация</p>
			<h1>Покажите, какое обращение ждёт ответа</h1>
			<p class="lede">
				Одна учебная неделя: у каждой строки статус и следующий шаг. Урок открыт сразу.
			</p>
			<div class="actions">
				<a class="button" href="#lesson">Открыть пробный урок</a>
			</div>
		</div>
		<WorkbookSlip row={example} note="Ниже та же неделя целиком: шесть строк и сводка." />
	</section>

	<article class="section" id="lesson">
		<h2>Зачем строка, если переписка уже есть</h2>
		<p>
			Переписка хранит слова. Учёт хранит следующий шаг. Пока обращение лежит только в чате, легко не
			заметить, что ответить должны вы, а не заказчик.
		</p>
		<p>Для маленькой мастерской хватает шести колонок: дата, шифр, канал, суть, статус, следующий шаг.</p>
		<p>Шифр вроде «демо-01» заменяет имя. Статусы: новое, ждёт нас, ждёт клиента, закрыто.</p>

		<h2>Как движется статус</h2>
		<ol class="flow" aria-label="Порядок статусов">
			<li><span class="flow-index">1</span><span><strong>Новое.</strong> Строку завели, следующий шаг ещё не выбран.</span></li>
			<li><span class="flow-index">2</span><span><strong>Ждёт нас.</strong> Ответ, срок или эскиз должны сделать мы.</span></li>
			<li><span class="flow-index">3</span><span><strong>Ждёт клиента.</strong> Мы уже спросили то, без чего шаг не сделать.</span></li>
			<li><span class="flow-index">4</span><span><strong>Закрыто.</strong> Отказ или завершённая работа. Следующего шага нет.</span></li>
		</ol>
		<p>Из «ждёт клиента» строка возвращается в «ждёт нас», когда ответ пришёл и снова нужно наше действие.</p>

		<h2>Рабочий пример</h2>
		<p>
			Мастерская «Северная полка» вымышлена. За неделю в таблице шесть обращений. Сводка считается по
			этим строкам.
		</p>
		<LedgerTable rows={LEDGER} caption="Учебная неделя. Все шифры и просьбы синтетические." />
		<dl class="summary-list">
			<div><dt>Всего</dt><dd>{summary.total}</dd></div>
			<div><dt>Ждёт нас</dt><dd>{summary.waitingOnUs}</dd></div>
			<div><dt>Ждёт клиента</dt><dd>{summary.waitingOnClient}</dd></div>
			<div><dt>Закрыто</dt><dd>{summary.closed}</dd></div>
		</dl>
		<p>
			Из {summary.total} строк {summary.waitingOnUs} ждут действия мастерской,
			{summary.waitingOnClient} — ответа заказчика, {summary.fresh} ещё не разобрано,
			{summary.closed} закрыты. Сводка считает строки, не деньги.
		</p>
	</article>

	<section class="section">
		<h2>Упражнение</h2>
		<p>Для каждой строки выберите статус и следующий шаг. Ответ открывается на странице.</p>
		<ol class="program">
			{#each exercise as row (row[0])}
				<li>
					<span class="index">{row[0].slice(-2)}</span>
					<span>
						<strong>{row[0]} · {row[1]}</strong>
						<span>{row[2]}. Подсказка: {row[3]}.</span>
					</span>
				</li>
			{/each}
		</ol>
		<details class="exercise">
			<summary>Показать ответ</summary>
			<ol>
				<li>демо-11 — новое. Открыть сообщение и решить, берёмся ли за полку.</li>
				<li>демо-12 — ждёт нас. Назначить дату замера: обещание уже дано.</li>
				<li>демо-13 — ждёт клиента. Без фото стены шаг сделать нельзя.</li>
				<li>демо-14 — закрыто. Следующего шага нет.</li>
			</ol>
		</details>
	</section>

	<section class="section">
		<h2>Файлы урока</h2>
		<p>Текстовая версия повторяет правило и упражнение. CSV содержит те же шесть строк, что и таблица.</p>
		<ul class="download-list">
			<li><a href={asset('/materials/lesson.txt')} download="lesson.txt">Скачать текстовую версию</a></li>
			<li><a href={asset('/materials/inquiries.csv')} download="inquiries.csv">Скачать CSV</a></li>
		</ul>
	</section>
</main>
