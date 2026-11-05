<script lang="ts">
	import { asset } from '$app/paths';
	import { page } from '#lib/page';
	import { DEMO_EVENT } from '#lib/event';
	import { LEDGER } from '#lib/ledger';
	import RegistrationForm from '#lib/RegistrationForm.svelte';
	import SiteHeader from '#lib/SiteHeader.svelte';
	import WorkbookSlip from '#lib/WorkbookSlip.svelte';

	const lead = LEDGER[0];
	const neighbor = LEDGER[1];
	const program = [
		['Отличить обращение от переписки', 'Один запрос — одна строка. Сообщение без следующего шага учётом не считается.'],
		['Поставить статус', 'Новое, ждёт нас, ждёт клиента или закрыто.'],
		['Собрать сводку недели', 'Сколько строк ждут ответа мастерской и сколько уже закрыты.'],
		['Проверить следующий шаг', 'Если действие не названо, строка ещё не разобрана.']
	];
</script>

<svelte:head>
	<title>Практикум — таблицы для малого бизнеса</title>
	<meta
		name="description"
		content="За 40 минут: собрать обращения мастерской в таблицу со статусом и следующим шагом."
	/>
</svelte:head>

<SiteHeader asideHref={page('/sample')} asideLabel="Пробный урок" />
<main id="content" class="frame">
	<section class="hero">
		<div class="hero-copy">
			<p class="stamp">Демонстрация</p>
			<h1>Соберите обращения из чатов в одну таблицу</h1>
			<p class="lede">
				За 40 минут — шесть колонок, статус каждой строки и следующий шаг. В конце занятия есть простая
				сводка недели.
			</p>
			<div class="actions">
				<a class="button" href="#registration">Попробовать регистрацию</a>
			</div>
		</div>
		<WorkbookSlip
			row={lead}
			note="{neighbor.code} уже {neighbor.status}: {neighbor.next}."
		/>
	</section>

	<section class="section">
		<h2>Что получается</h2>
		<ol class="chain">
			<li><span class="index">01</span><span><strong>Обращение</strong> <span>Одна просьба — одна строка, даже если переписка длинная.</span></span></li>
			<li><span class="index">02</span><span><strong>Статус</strong> <span>Новое, ждёт нас, ждёт клиента или закрыто.</span></span></li>
			<li><span class="index">03</span><span><strong>Следующий шаг</strong> <span>Кто делает действие: мастерская или заказчик.</span></span></li>
		</ol>
		<p>Для владельца мастерской или студии, который сам отвечает на сообщения.</p>
	</section>

	<section class="section">
		<h2>Программа</h2>
		<ol class="program">
			{#each program as item, index (item[0])}
				<li>
					<span class="index">0{index + 1}</span>
					<span>
						<strong>{item[0]}</strong>
						<span>{item[1]}</span>
					</span>
				</li>
			{/each}
		</ol>
	</section>

	<section class="panel">
		<h2>Условия</h2>
		<p>
			{DEMO_EVENT.displayDate}, {DEMO_EVENT.displayTime} МСК. Мероприятие не назначено: это время
			демонстрационного календаря.
		</p>
		<ul class="conditions">
			<li>Формат: разбор одной таблицы.</li>
			<li>С собой 5–10 обезличенных обращений за неделю.</li>
			<li>На форме — тестовая персона, без имени и контактов.</li>
		</ul>
	</section>

	<section class="section" id="registration">
		<h2>Регистрация</h2>
		<p>Кнопка проверяет форму здесь. Надпись об успехе означает только эту проверку.</p>
		<RegistrationForm />
	</section>

	<section class="section">
		<h2>Календарь</h2>
		<p>
			Файл скачивается отдельно и не записывает на практикум. Внутри пометка DEMO, время
			{DEMO_EVENT.displayTime} и часовой пояс {DEMO_EVENT.timezone}.
		</p>
		<p>
			<a class="button-quiet" href={asset('/materials/workshop-demo.ics')} download="workshop-demo.ics">
				Скачать календарь
			</a>
		</p>
	</section>
</main>
