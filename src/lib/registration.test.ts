import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	HTTP_MODE_ENABLED,
	LOCAL_RESULT_MESSAGE,
	createSubmitGuard,
	performHttpSubmission,
	resetRegistrationMemory,
	submitDemoRegistration,
	type RegistrationInput
} from './registration';

function input(overrides: Partial<RegistrationInput> = {}): RegistrationInput {
	return {
		preset_id: 'demo-shelf',
		acknowledged: true,
		note: '',
		registration_open: true,
		transport_preview: 'normal',
		idempotency_key: 'demo-key-001',
		...overrides
	};
}

afterEach(() => {
	resetRegistrationMemory();
	vi.useRealTimers();
});

describe('validate and local states', () => {
	it('rejects an empty persona, a missing confirmation and a long note', async () => {
		const outcome = await submitDemoRegistration(
			input({ preset_id: '', acknowledged: false, note: 'я'.repeat(121) }),
			{ mode: 'mock' }
		);
		expect(outcome.kind).toBe('invalid');
		if (outcome.kind !== 'invalid') return;
		expect(outcome.errors.preset_id).toBeTruthy();
		expect(outcome.errors.acknowledged).toBeTruthy();
		expect(outcome.errors.note).toBeTruthy();
		expect(outcome.message).toContain('не отправлена');
	});

	it('accepts a note of 120 characters locally without sending', async () => {
		const outcome = await submitDemoRegistration(input({ note: 'я'.repeat(120) }), { mode: 'mock' });
		expect(outcome).toMatchObject({
			kind: 'accepted_local',
			message: LOCAL_RESULT_MESSAGE,
			replayed: false
		});
	});

	it('keeps registration closed and does not claim a booking', async () => {
		const outcome = await submitDemoRegistration(input({ registration_open: false }), { mode: 'mock' });
		expect(outcome).toMatchObject({ kind: 'closed', code: 'registration_closed' });
		expect(JSON.stringify(outcome)).not.toContain('Вы записаны');
	});

	it('returns the same local result for the same key and a conflict for other fields', async () => {
		const first = await submitDemoRegistration(input(), { mode: 'mock' });
		const second = await submitDemoRegistration(input(), { mode: 'mock' });
		expect(first).toMatchObject({ kind: 'accepted_local', replayed: false });
		expect(second).toMatchObject({
			kind: 'accepted_local',
			message: LOCAL_RESULT_MESSAGE,
			replayed: true
		});
		const conflict = await submitDemoRegistration(input({ note: 'другая пометка' }), { mode: 'mock' });
		expect(conflict).toMatchObject({ kind: 'error', code: 'idempotency_conflict' });
	});

	it('shows timeout and server refusal without a success message', async () => {
		const timeout = await submitDemoRegistration(input({ transport_preview: 'timeout', idempotency_key: 'demo-key-002' }), {
			mode: 'mock'
		});
		const refused = await submitDemoRegistration(input({ transport_preview: 'refused', idempotency_key: 'demo-key-003' }), {
			mode: 'mock'
		});
		expect(timeout).toMatchObject({ kind: 'error', code: 'timeout' });
		expect(refused).toMatchObject({ kind: 'error', code: 'server_refused' });
		expect(`${timeout.kind === 'error' ? timeout.message : ''}${refused.kind === 'error' ? refused.message : ''}`).not.toContain(
			'Вы записаны'
		);
	});

	it('waits out the local delay before the demonstration result', async () => {
		vi.useFakeTimers();
		let settled = false;
		const pending = submitDemoRegistration(input({ idempotency_key: 'demo-key-009' }), {
			mode: 'mock',
			delayMs: 700
		}).then((outcome) => {
			settled = true;
			return outcome;
		});
		await vi.advanceTimersByTimeAsync(699);
		expect(settled).toBe(false);
		await vi.advanceTimersByTimeAsync(1);
		await expect(pending).resolves.toMatchObject({ kind: 'accepted_local', message: LOCAL_RESULT_MESSAGE });
	});

	it('replays a mock timeout at once; this is not a new transport attempt', async () => {
		vi.useFakeTimers();
		const pending = submitDemoRegistration(
			input({ transport_preview: 'timeout', idempotency_key: 'demo-key-010' }),
			{ mode: 'mock', delayMs: 700 }
		);
		await vi.advanceTimersByTimeAsync(700);
		await expect(pending).resolves.toMatchObject({ kind: 'error', code: 'timeout', replayed: false });
		const replay = await submitDemoRegistration(
			input({ transport_preview: 'timeout', idempotency_key: 'demo-key-010' }),
			{ mode: 'mock', delayMs: 700 }
		);
		expect(replay).toMatchObject({ kind: 'error', code: 'timeout', replayed: true });
	});

	it('ignores a second click while the first attempt is in flight', () => {
		const guard = createSubmitGuard();
		expect(guard.tryEnter()).toBe(true);
		expect(guard.tryEnter()).toBe(false);
		guard.leave();
		expect(guard.tryEnter()).toBe(true);
	});
});

describe('http transport', () => {
	it('does not call the network while the server mode is off', async () => {
		expect(HTTP_MODE_ENABLED).toBe(false);
		const fetchImpl = vi.fn();
		const outcome = await submitDemoRegistration(input(), {
			mode: 'http',
			fetchImpl
		});
		expect(outcome).toMatchObject({ kind: 'error', code: 'http_disabled' });
		expect(fetchImpl).not.toHaveBeenCalled();
	});

	it('reads a real accepted response as saved, not delivered everywhere', async () => {
		const fetchImpl = vi.fn(async () =>
			Response.json({ submission_id: 'sub_demo_1', status: 'accepted' }, { status: 200 })
		);
		const outcome = await performHttpSubmission(input(), { mode: 'http', fetchImpl });
		expect(outcome).toMatchObject({
			kind: 'accepted_server',
			submission_id: 'sub_demo_1',
			status: 'accepted'
		});
		if (outcome.kind === 'accepted_server') {
			expect(outcome.message).toContain('сохранил');
			expect(outcome.message).not.toContain('Вы записаны');
		}
		const request = fetchImpl.mock.calls[0];
		expect(request?.[0]).toBe('/api/demo/registrations');
		expect(JSON.parse(String(request?.[1]?.body))).toEqual({
			project_id: 'd7',
			scenario_id: 'workshop',
			preset_id: 'demo-shelf',
			idempotency_key: 'demo-key-001'
		});
	});

	it('hides stack traces and reports timeout, refusal and a broken response', async () => {
		const refused = await performHttpSubmission(input(), {
			mode: 'http',
			fetchImpl: vi.fn(async () =>
				Response.json(
					{ code: 'registration_closed', message: 'Регистрация закрыта.', stack: 'Error: secret\n    at Function' },
					{ status: 409 }
				)
			)
		});
		expect(refused).toMatchObject({ kind: 'error', code: 'registration_closed', message: 'Регистрация закрыта.' });

		const leaked = await performHttpSubmission(input({ idempotency_key: 'demo-key-004' }), {
			mode: 'http',
			fetchImpl: vi.fn(async () =>
				Response.json({ code: 'bad', message: 'Error: token=secret\n    at handler' }, { status: 500 })
			)
		});
		expect(leaked.kind).toBe('error');
		if (leaked.kind === 'error') {
			expect(leaked.message).not.toContain('token');
			expect(leaked.message).not.toContain('at handler');
		}

		const broken = await performHttpSubmission(input({ idempotency_key: 'demo-key-005' }), {
			mode: 'http',
			fetchImpl: vi.fn(async () => Response.json({ status: 'queued' }, { status: 200 }))
		});
		expect(broken).toMatchObject({ kind: 'error', code: 'bad_response' });

		const timeout = await performHttpSubmission(input({ idempotency_key: 'demo-key-006' }), {
			mode: 'http',
			fetchImpl: vi.fn(() => Promise.reject(Object.assign(new Error('slow'), { name: 'TimeoutError' })))
		});
		expect(timeout).toMatchObject({ kind: 'error', code: 'timeout' });

		const network = await performHttpSubmission(input({ idempotency_key: 'demo-key-007' }), {
			mode: 'http',
			fetchImpl: vi.fn(() => Promise.reject(Object.assign(new Error('stack at secret'), { name: 'TypeError' })))
		});
		expect(network).toMatchObject({ kind: 'error', code: 'network' });
		if (network.kind === 'error') expect(network.message).not.toContain('secret');
	});
});
