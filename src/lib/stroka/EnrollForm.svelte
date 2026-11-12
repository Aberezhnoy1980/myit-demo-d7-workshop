<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '#lib/page';
	import {
		CONTACT_TYPES,
		DEMO_ENROLL,
		EMPTY_ENROLL,
		OCCUPATIONS,
		VOLUMES,
		deliveryLine,
		validateEnroll,
		type EnrollErrors,
		type EnrollInput
	} from './enroll';

	// Значения живут только в памяти компонента: ни хранилища браузера, ни адреса, ни сети.
	let form = $state<EnrollInput>({ ...EMPTY_ENROLL });
	let errors = $state<EnrollErrors>({});
	let showErrors = $state(false);
	let confirmed = $state<EnrollInput | null>(null);
	let ready = $state(false);
	let filledDemo = $state(false);

	let summaryEl = $state<HTMLElement | null>(null);
	let confirmEl = $state<HTMLElement | null>(null);
	let nameEl = $state<HTMLInputElement | null>(null);

	const contactMeta = $derived(CONTACT_TYPES.find((type) => type.id === form.contactType)!);
	const errorList = $derived(
		(['name', 'contact'] as const).filter((key) => errors[key]).map((key) => ({ key, text: errors[key]! }))
	);

	onMount(() => {
		// Пока скрипт не загружен, поля выключены: браузер не отправит форму сам и не добавит значения в адрес.
		ready = true;
	});

	function fillDemo(): void {
		form = { ...DEMO_ENROLL };
		errors = {};
		showErrors = false;
		filledDemo = true;
	}

	function revalidate(): void {
		if (showErrors) errors = validateEnroll(form);
	}

	async function submit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		errors = validateEnroll(form);
		if (Object.keys(errors).length > 0) {
			showErrors = true;
			await tick();
			summaryEl?.focus();
			return;
		}
		showErrors = false;
		confirmed = { ...form };
		await tick();
		confirmEl?.focus();
	}

	async function edit(): Promise<void> {
		confirmed = null;
		await tick();
		nameEl?.focus();
	}

	function focusField(key: 'name' | 'contact'): void {
		document.getElementById(`enroll-${key}`)?.focus();
	}
</script>

{#if !confirmed}
	<form class="enroll" autocomplete="off" novalidate onsubmit={submit} aria-describedby="enroll-demo-note">
		<p class="demo-note" id="enroll-demo-note">
			<strong>Демо-режим:</strong> данные никуда не отправляются и не сохраняются. После перезагрузки страницы
			форма пустая.
		</p>

		<div class="fill">
			<button type="button" class="s-btn" onclick={fillDemo} disabled={!ready}>Заполнить демо-данными</button>
			<p class="fill-hint" aria-live="polite">
				{filledDemo ? 'Поля заполнены данными вымышленной участницы. Их можно изменить.' : 'Самый быстрый путь: подставить вымышленную участницу.'}
			</p>
		</div>

		{#if showErrors && errorList.length > 0}
			<div class="summary" role="alert" tabindex="-1" bind:this={summaryEl}>
				<p class="summary-title">Проверьте поля: {errorList.length === 1 ? 'одна ошибка' : `ошибок — ${errorList.length}`}</p>
				<ul>
					{#each errorList as item (item.key)}
						<li>
							<a
								href="#enroll-{item.key}"
								onclick={(e) => {
									e.preventDefault();
									focusField(item.key);
								}}>{item.text}</a
							>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<fieldset class="fields" disabled={!ready}>
			<legend class="sr-only">Данные для записи в группу</legend>

			<div class="field" class:invalid={showErrors && errors.name}>
				<label for="enroll-name">Как к вам обращаться</label>
				<input
					id="enroll-name"
					name="enroll-name"
					type="text"
					autocomplete="off"
					bind:value={form.name}
					bind:this={nameEl}
					oninput={revalidate}
					aria-invalid={showErrors && errors.name ? 'true' : undefined}
					aria-describedby={showErrors && errors.name ? 'enroll-name-error' : undefined}
				/>
				{#if showErrors && errors.name}
					<p class="error" id="enroll-name-error">{errors.name}</p>
				{/if}
			</div>

			<fieldset class="field radios">
				<legend>Куда прислать варианты даты</legend>
				<div class="radio-row">
					{#each CONTACT_TYPES as type (type.id)}
						<label class="radio">
							<input
								type="radio"
								name="enroll-contact-type"
								value={type.id}
								bind:group={form.contactType}
								onchange={revalidate}
							/>
							<span>{type.label}</span>
						</label>
					{/each}
				</div>
			</fieldset>

			<div class="field" class:invalid={showErrors && errors.contact}>
				<label for="enroll-contact">{contactMeta.field}</label>
				<input
					id="enroll-contact"
					name="enroll-contact"
					type={form.contactType === 'email' ? 'email' : form.contactType === 'phone' ? 'tel' : 'text'}
					inputmode={form.contactType === 'phone' ? 'tel' : form.contactType === 'email' ? 'email' : 'text'}
					autocomplete="off"
					bind:value={form.contact}
					oninput={revalidate}
					aria-invalid={showErrors && errors.contact ? 'true' : undefined}
					aria-describedby="enroll-contact-hint{showErrors && errors.contact ? ' enroll-contact-error' : ''}"
				/>
				<p class="hint" id="enroll-contact-hint">{contactMeta.hint}</p>
				{#if showErrors && errors.contact}
					<p class="error" id="enroll-contact-error">{errors.contact}</p>
				{/if}
			</div>

			<div class="pair">
				<div class="field">
					<label for="enroll-occupation">Чем занимаетесь <span class="opt">необязательно</span></label>
					<select id="enroll-occupation" name="enroll-occupation" bind:value={form.occupation}>
						<option value="">Не указывать</option>
						{#each OCCUPATIONS as item (item.id)}
							<option value={item.id}>{item.label}</option>
						{/each}
					</select>
				</div>
				<div class="field">
					<label for="enroll-volume">Обращений в неделю <span class="opt">необязательно</span></label>
					<select id="enroll-volume" name="enroll-volume" bind:value={form.volume}>
						<option value="">Не указывать</option>
						{#each VOLUMES as item (item.id)}
							<option value={item.id}>{item.label}</option>
						{/each}
					</select>
				</div>
			</div>
		</fieldset>

		<div class="submit-row">
			<button type="submit" class="s-btn s-btn--quiet submit" disabled={!ready}>Записаться в группу (демо)</button>
			<p class="submit-note">Проверка идёт только на этой странице. Запись не создаётся.</p>
		</div>
		<noscript>
			<p class="demo-note">Для демо-формы нужен JavaScript. Без него поля выключены и ничего не отправляется.</p>
		</noscript>
	</form>
{:else}
	<section class="confirm" aria-labelledby="confirm-title">
		<div class="confirm-demo" bind:this={confirmEl} tabindex="-1">
			<h3 id="confirm-title">Демо-режим: настоящей записи не произошло</h3>
			<p>Место не забронировано, данные не отправлены и не сохранены. Форма только проверила поля на этой странице.</p>
		</div>

		<p class="example-label">Так экран выглядел бы у участника:</p>
		<div class="example" aria-label="Пример экрана участника">
			<span class="example-tag" aria-hidden="true">пример</span>
			<p class="example-title">{confirmed.name.trim()}, вы в списке группы «Утренний разбор».</p>
			<p>Когда в группе будет восемь человек, {deliveryLine(confirmed)}.</p>
			<p>
				Пока ждёте: соберите 5–10 обращений за последнюю неделю — скриншоты или выписки без фамилий и
				телефонов клиентов.
			</p>
		</div>

		<div class="confirm-actions">
			<a class="s-btn" href={page('/razbor')}>Пройти пробный разбор</a>
			<button type="button" class="s-btn s-btn--quiet" onclick={edit}>Изменить данные</button>
		</div>
	</section>
{/if}

<style>
	.enroll,
	.confirm {
		display: grid;
		gap: 1.1rem;
		min-width: 0;
	}

	.demo-note {
		margin: 0;
		padding: 0.75rem 0.9rem;
		background: var(--s-ink);
		color: #f4efe5;
		border-radius: var(--s-radius);
		font-size: 0.95rem;
	}

	.fill {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
	}

	.fill-hint {
		margin: 0;
		flex: 1 1 14rem;
		color: var(--s-muted);
		font-size: 0.92rem;
	}

	.summary {
		padding: 0.85rem 1rem;
		background: var(--s-bad-bg);
		border-left: 5px solid var(--s-bad);
		border-radius: var(--s-radius);
	}

	.summary-title {
		margin: 0 0 0.3rem;
		font-weight: 700;
		color: var(--s-bad);
	}

	.summary ul {
		margin: 0;
		padding-left: 1.1rem;
	}

	.summary a {
		color: var(--s-ink);
	}

	.fields {
		display: grid;
		gap: 1rem;
		margin: 0;
		padding: 0;
		border: 0;
		min-width: 0;
	}

	.field {
		display: grid;
		gap: 0.35rem;
		margin: 0;
		padding: 0;
		border: 0;
		min-width: 0;
	}

	.field label,
	.field legend {
		padding: 0;
		font-weight: 600;
	}

	.opt {
		font-weight: 400;
		color: var(--s-muted);
		font-size: 0.88rem;
	}

	.field input[type='text'],
	.field input[type='email'],
	.field input[type='tel'],
	.field select {
		width: 100%;
		max-width: 30rem;
		min-height: 48px;
		padding: 0.5rem 0.7rem;
		border: 1.5px solid var(--s-line);
		border-radius: 8px;
		background: #fff;
		color: var(--s-ink);
		font: inherit;
	}

	.field input:focus-visible,
	.field select:focus-visible {
		border-color: var(--s-ink);
	}

	.invalid input {
		border-color: var(--s-bad);
		background: #fffaf8;
	}

	.hint {
		margin: 0;
		color: var(--s-muted);
		font-size: 0.88rem;
	}

	.error {
		margin: 0;
		color: var(--s-bad);
		font-weight: 600;
		font-size: 0.92rem;
	}

	.radio-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.radio-row .radio {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 44px;
		padding: 0 0.95rem 0 0.75rem;
		border: 1.5px solid var(--s-line);
		border-radius: 999px;
		background: #fff;
		cursor: pointer;
		font-weight: 400 !important;
	}

	.radio:has(input:checked) {
		border-color: var(--s-ink);
		background: var(--s-paper);
		font-weight: 600 !important;
	}

	.radio:has(input:focus-visible) {
		outline: 3px solid var(--s-focus);
		outline-offset: 2px;
	}

	.radio input {
		width: 1.05rem;
		height: 1.05rem;
		margin: 0;
		accent-color: var(--s-ink);
	}

	.pair {
		display: grid;
		gap: 1rem;
	}

	.submit-row {
		display: grid;
		gap: 0.4rem;
		justify-items: start;
		padding-top: 0.4rem;
		border-top: 1px dashed var(--s-rule);
	}

	.submit-note {
		margin: 0;
		color: var(--s-muted);
		font-size: 0.88rem;
	}

	.s-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Подтверждение */

	.confirm-demo {
		padding: 1rem 1.1rem;
		background: var(--s-ink);
		color: #f4efe5;
		border-radius: var(--s-radius);
	}

	.confirm-demo h3 {
		margin: 0 0 0.35rem;
		font-family: var(--serif);
		font-size: 1.35rem;
		line-height: 1.2;
	}

	.confirm-demo p {
		margin: 0;
	}

	.confirm-demo:focus-visible {
		outline-color: var(--s-us);
	}

	.example-label {
		margin: 0.3rem 0 -0.4rem;
		color: var(--s-muted);
		font-size: 0.92rem;
		font-weight: 600;
	}

	.example {
		position: relative;
		max-width: 32rem;
		padding: 1.4rem 1.2rem 1.1rem;
		background: #fff;
		border: 2px dashed var(--s-line);
		border-radius: 14px;
	}

	.example p {
		margin: 0 0 0.6rem;
	}

	.example p:last-child {
		margin-bottom: 0;
	}

	.example-title {
		font-family: var(--serif);
		font-size: 1.2rem;
		font-weight: 600;
		line-height: 1.25;
	}

	.example-tag {
		position: absolute;
		top: -0.75rem;
		left: 1rem;
		padding: 0.1rem 0.5rem;
		background: var(--s-paper);
		border: 1.5px dashed var(--s-line);
		border-radius: 4px;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--s-muted);
	}

	.confirm-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	@media (min-width: 700px) {
		.pair {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 699px) {
		.fill .s-btn,
		.submit,
		.confirm-actions > * {
			width: 100%;
		}
	}
</style>
