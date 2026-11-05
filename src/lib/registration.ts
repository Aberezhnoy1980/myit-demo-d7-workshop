export const PROJECT_ID = 'd7' as const;
export const SCENARIO_ID = 'workshop' as const;

/** Серверный приём выключен, пока контракт не согласован с Codex. */
export const HTTP_MODE_ENABLED = false;

export const LOCAL_RESULT_MESSAGE = 'Демонстрация: регистрация не отправлена';

export const PRESETS = [
	{
		id: 'demo-shelf',
		label: 'Мастерская «Северная полка»',
		detail: 'Тестовая персона, без имени и контактов.'
	},
	{
		id: 'demo-atelier',
		label: 'Студия «Тихий угол»',
		detail: 'Тестовая персона, без имени и контактов.'
	}
] as const;

export type PresetId = (typeof PRESETS)[number]['id'];
export type TransportPreview = 'normal' | 'timeout' | 'refused';
export type RegistrationMode = 'mock' | 'http';

export interface RegistrationInput {
	preset_id: string;
	acknowledged: boolean;
	note: string;
	registration_open: boolean;
	transport_preview: TransportPreview;
	idempotency_key: string;
}

export interface FieldErrors {
	preset_id?: string;
	acknowledged?: string;
	note?: string;
	idempotency_key?: string;
}

export type SubmitOutcome =
	| {
			kind: 'invalid';
			errors: FieldErrors;
			message: string;
			replayed: boolean;
	  }
	| {
			kind: 'closed';
			code: 'registration_closed';
			message: string;
			replayed: boolean;
	  }
	| {
			kind: 'accepted_local';
			message: typeof LOCAL_RESULT_MESSAGE;
			idempotency_key: string;
			replayed: boolean;
	  }
	| {
			kind: 'accepted_server';
			submission_id: string;
			status: 'accepted';
			message: string;
			replayed: boolean;
	  }
	| {
			kind: 'error';
			code: string;
			message: string;
			replayed: boolean;
	  };

export interface SubmitOptions {
	mode: RegistrationMode;
	delayMs?: number;
	timeoutMs?: number;
	endpoint?: string;
	fetchImpl?: typeof fetch;
}

const NOT_SENT = 'Заявка не отправлена.';
const memory = new Map<string, { fingerprint: string; outcome: SubmitOutcome }>();

export function resetRegistrationMemory(): void {
	memory.clear();
}

export function createSubmitGuard(): { tryEnter: () => boolean; leave: () => void } {
	let pending = false;
	return {
		tryEnter() {
			if (pending) return false;
			pending = true;
			return true;
		},
		leave() {
			pending = false;
		}
	};
}

export function validateRegistration(input: RegistrationInput): FieldErrors {
	const errors: FieldErrors = {};
	const known = new Set<string>(PRESETS.map((preset) => preset.id));
	if (!known.has(input.preset_id)) {
		errors.preset_id = 'Выберите тестовую персону.';
	}
	if (!input.acknowledged) {
		errors.acknowledged = 'Подтвердите, что это демонстрация и данные никуда не отправляются.';
	}
	if (input.note.length > 120) {
		errors.note = 'Пометка длиннее 120 символов. Укоротите её: она остаётся только в браузере.';
	}
	if (!/^[A-Za-z0-9-]{8,80}$/.test(input.idempotency_key)) {
		errors.idempotency_key = 'Ключ повторной отправки повреждён. Обновите страницу.';
	}
	return errors;
}

function fingerprint(input: RegistrationInput): string {
	return JSON.stringify({
		preset_id: input.preset_id,
		acknowledged: input.acknowledged,
		note: input.note,
		registration_open: input.registration_open,
		transport_preview: input.transport_preview
	});
}

function remember(key: string, print: string, outcome: SubmitOutcome): SubmitOutcome {
	memory.set(key, { fingerprint: print, outcome: { ...outcome, replayed: false } });
	return outcome;
}

function delay(ms: number): Promise<void> {
	if (ms <= 0) return Promise.resolve();
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeCode(value: unknown): string | null {
	return typeof value === 'string' && /^[a-z0-9_]{1,40}$/.test(value) ? value : null;
}

function safeMessage(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const message = value.trim();
	if (message.length < 1 || message.length > 200) return null;
	if (/[\r\n]/.test(message) || /at\s+\S+/.test(message) || message.includes('Error:')) return null;
	return message;
}

function contractBody(input: RegistrationInput): string {
	return JSON.stringify({
		project_id: PROJECT_ID,
		scenario_id: SCENARIO_ID,
		preset_id: input.preset_id,
		idempotency_key: input.idempotency_key
	});
}

export async function performHttpSubmission(
	input: RegistrationInput,
	options: SubmitOptions
): Promise<SubmitOutcome> {
	const endpoint = options.endpoint ?? '/api/demo/registrations';
	const fetchImpl = options.fetchImpl ?? fetch;
	const timeoutMs = options.timeoutMs ?? 4000;
	try {
		const response = await fetchImpl(endpoint, {
			method: 'POST',
			headers: {
				accept: 'application/json',
				'content-type': 'application/json'
			},
			body: contractBody(input),
			signal: AbortSignal.timeout(timeoutMs)
		});
		let payload: unknown = null;
		try {
			payload = await response.json();
		} catch {
			payload = null;
		}
		const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
		if (!response.ok) {
			return {
				kind: 'error',
				code: safeCode(record.code) ?? 'server_error',
				message:
					safeMessage(record.message) ??
					`Демонстрация: сервер не принял заявку. ${NOT_SENT}`,
				replayed: false
			};
		}
		const submissionId = record.submission_id;
		if (record.status !== 'accepted' || typeof submissionId !== 'string' || !/^[A-Za-z0-9_-]{8,80}$/.test(submissionId)) {
			return {
				kind: 'error',
				code: 'bad_response',
				message: `Демонстрация: ответ сервера не похож на подтверждение сохранения. ${NOT_SENT}`,
				replayed: false
			};
		}
		return {
			kind: 'accepted_server',
			submission_id: submissionId,
			status: 'accepted',
			message: `Сервер сохранил демонстрационную заявку ${submissionId}. Это подтверждение сохранения, не запись на мероприятие и не доставка во все каналы.`,
			replayed: false
		};
	} catch (error) {
		const name = error instanceof Error ? error.name : '';
		const timedOut = name === 'TimeoutError' || name === 'AbortError';
		return {
			kind: 'error',
			code: timedOut ? 'timeout' : 'network',
			message: timedOut
				? 'Демонстрация: ответ сервера не подтверждён. Неизвестно, сохранена ли заявка.'
				: 'Демонстрация: связь прервалась. Результат сохранения не подтверждён.',
			replayed: false
		};
	}
}

async function performMock(input: RegistrationInput, options: SubmitOptions): Promise<SubmitOutcome> {
	await delay(options.delayMs ?? 0);
	if (input.transport_preview === 'timeout') {
		return {
			kind: 'error',
			code: 'timeout',
			message: `Демонстрация: ответ не получен за отведённое время. ${NOT_SENT}`,
			replayed: false
		};
	}
	if (input.transport_preview === 'refused') {
		return {
			kind: 'error',
			code: 'server_refused',
			message: `Демонстрация: сервер отклонил запрос. ${NOT_SENT}`,
			replayed: false
		};
	}
	return {
		kind: 'accepted_local',
		message: LOCAL_RESULT_MESSAGE,
		idempotency_key: input.idempotency_key,
		replayed: false
	};
}

export async function submitDemoRegistration(
	input: RegistrationInput,
	options: SubmitOptions
): Promise<SubmitOutcome> {
	const print = fingerprint(input);
	const previous = memory.get(input.idempotency_key);
	if (previous) {
		if (previous.fingerprint !== print) {
			return {
				kind: 'error',
				code: 'idempotency_conflict',
				message: `Ключ уже использован с другими полями. Новая заявка не создана. ${NOT_SENT}`,
				replayed: false
			};
		}
		return { ...previous.outcome, replayed: true };
	}

	const errors = validateRegistration(input);
	if (Object.keys(errors).length > 0) {
		return remember(input.idempotency_key, print, {
			kind: 'invalid',
			errors,
			message: `Проверьте поля. ${NOT_SENT}`,
			replayed: false
		});
	}
	if (!input.registration_open) {
		return remember(input.idempotency_key, print, {
			kind: 'closed',
			code: 'registration_closed',
			message: 'Регистрация на демонстрацию закрыта. Заявка не отправлялась.',
			replayed: false
		});
	}
	if (options.mode === 'http') {
		if (!HTTP_MODE_ENABLED) {
			return remember(input.idempotency_key, print, {
				kind: 'error',
				code: 'http_disabled',
				message: `Демонстрация: серверный приём выключен. ${NOT_SENT}`,
				replayed: false
			});
		}
		const outcome = await performHttpSubmission(input, options);
		return remember(input.idempotency_key, print, outcome);
	}
	const outcome = await performMock(input, options);
	return remember(input.idempotency_key, print, outcome);
}
