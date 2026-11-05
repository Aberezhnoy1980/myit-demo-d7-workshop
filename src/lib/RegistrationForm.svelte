<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		LOCAL_RESULT_MESSAGE,
		PRESETS,
		createSubmitGuard,
		submitDemoRegistration,
		type SubmitOutcome,
		type TransportPreview
	} from './registration';

	const guard = createSubmitGuard();
	let presetId = $state('');
	let acknowledged = $state(false);
	let note = $state('');
	let registrationOpen = $state(true);
	let transport = $state<TransportPreview>('normal');
	let idempotencyKey = $state('');
	let outcome = $state<SubmitOutcome | null>(null);
	let pending = $state(false);
	let alertEl = $state<HTMLElement | null>(null);
	let attemptId = 0;

	onMount(() => {
		idempotencyKey = crypto.randomUUID();
	});

	function touch(): void {
		attemptId += 1;
		idempotencyKey = crypto.randomUUID();
		if (pending) {
			pending = false;
			guard.leave();
			outcome = {
				kind: 'error',
				code: 'attempt_superseded',
				message: 'Поля изменились. Прежний ответ не показывается. Заявка не отправлена.',
				replayed: false
			};
			return;
		}
		outcome = null;
	}

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		if (!guard.tryEnter()) return;
		const id = ++attemptId;
		const snapshot = {
			preset_id: presetId,
			acknowledged,
			note,
			registration_open: registrationOpen,
			transport_preview: transport,
			idempotency_key: idempotencyKey
		};
		pending = true;
		outcome = null;
		try {
			const result = await submitDemoRegistration(snapshot, { mode: 'mock', delayMs: 700 });
			if (id !== attemptId) return;
			outcome = result;
			if (result.kind === 'invalid') {
				await tick();
				alertEl?.focus();
			}
		} finally {
			if (id === attemptId) {
				pending = false;
				guard.leave();
			}
		}
	}

	const errors = $derived(outcome?.kind === 'invalid' ? outcome.errors : {});
	const statusState = $derived(
		pending ? 'waiting' : !registrationOpen ? 'closed' : outcome ? outcome.kind : 'idle'
	);
	const retry = $derived(
		!pending &&
			outcome !== null &&
			outcome.kind !== 'invalid' &&
			!(outcome.kind === 'error' && outcome.code === 'attempt_superseded')
	);
</script>

<form class="form" autocomplete="off" onsubmit={handleSubmit}>
	<fieldset aria-describedby={errors.preset_id ? 'preset-error' : undefined}>
		<legend>Тестовая персона</legend>
		{#each PRESETS as preset (preset.id)}
			<label class="choice">
				<input
					type="radio"
					name="preset_id"
					value={preset.id}
					checked={presetId === preset.id}
					onchange={() => {
						presetId = preset.id;
						touch();
					}}
				/>
				<span>
					<strong>{preset.label}</strong>
					<span>{preset.detail}</span>
				</span>
			</label>
		{/each}
		{#if errors.preset_id}
			<p id="preset-error" class="error">{errors.preset_id}</p>
		{/if}
	</fieldset>

	<div class="field">
		<label for="note">Пометка для себя, необязательно</label>
		<input
			id="note"
			name="note"
			type="text"
			bind:value={note}
			aria-invalid={errors.note ? 'true' : undefined}
			aria-describedby="note-hint{errors.note ? ' note-error' : ''}"
			oninput={touch}
		/>
		<p id="note-hint" class="hint">До 120 символов. Пометка остаётся в браузере.</p>
		{#if errors.note}
			<p id="note-error" class="error">{errors.note}</p>
		{/if}
	</div>

	<label class="choice">
		<input
			id="acknowledged"
			type="checkbox"
			bind:checked={acknowledged}
			aria-invalid={errors.acknowledged ? 'true' : undefined}
			aria-describedby={errors.acknowledged ? 'ack-error' : undefined}
			onchange={touch}
		/>
		<span>
			<strong>Это демонстрация</strong>
			<span>Имя, телефон и почта не собираются. Заявка никуда не отправляется.</span>
		</span>
	</label>
	{#if errors.acknowledged}
		<p id="ack-error" class="error">{errors.acknowledged}</p>
	{/if}

	<details class="states">
		<summary>Проверить другие состояния</summary>
		<label class="choice">
			<input type="checkbox" bind:checked={registrationOpen} onchange={touch} />
			<span>
				<strong>Регистрация открыта</strong>
				<span>Снимите флажок, чтобы увидеть закрытую регистрацию.</span>
			</span>
		</label>
		<div class="field">
			<label for="transport">Какой ответ показать</label>
			<select id="transport" bind:value={transport} onchange={touch}>
				<option value="normal">Обычный демонстрационный ответ</option>
				<option value="timeout">Таймаут</option>
				<option value="refused">Отказ</option>
			</select>
		</div>
	</details>

	{#if outcome?.kind === 'invalid'}
		<div class="alert" role="alert" tabindex="-1" bind:this={alertEl}>
			<p>{outcome.message}</p>
		</div>
	{/if}

	<div class="status" role="status" aria-live="polite" data-state={statusState}>
		{#if pending}
			<p>Проверяем демонстрационную заявку.</p>
		{:else if !registrationOpen}
			<p>Регистрация на демонстрацию закрыта. Заявка не отправлялась.</p>
		{:else if outcome && outcome.kind !== 'invalid'}
			<p>{outcome.kind === 'accepted_local' ? LOCAL_RESULT_MESSAGE : outcome.message}</p>
			{#if outcome.replayed && outcome.kind === 'accepted_local'}
				<p class="replay">Повтор с тем же ключом не создаёт новую заявку.</p>
			{:else if outcome.replayed}
				<p class="replay">Снова показан тот же демонстрационный ответ. Новая попытка не запускалась.</p>
			{/if}
		{:else}
			<p>Заявка ещё не проверялась.</p>
		{/if}
	</div>

	<div class="actions">
		<button class="button" type="submit" disabled={pending || !registrationOpen || !idempotencyKey}>
			{retry ? 'Повторить' : 'Попробовать регистрацию'}
		</button>
	</div>
	<noscript>
		<p>Без JavaScript кнопка форму не проверяет. Текст страницы остаётся на месте. Заявка не отправляется.</p>
	</noscript>
</form>
