import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LEDGER, summarize, toCsv } from './ledger';

describe('ledger', () => {
	it('counts the synthetic week and matches the downloadable csv', () => {
		expect(summarize(LEDGER)).toEqual({
			total: 6,
			waitingOnUs: 2,
			waitingOnClient: 1,
			fresh: 1,
			closed: 2
		});
		const csv = toCsv(LEDGER);
		expect(csv.startsWith('\uFEFF')).toBe(true);
		expect(csv).toContain('"Полка 180 см, срок к выходным"');
		expect(csv).not.toMatch(/^[=+\-@]/m);
		expect(readFileSync(new URL('../../static/materials/inquiries.csv', import.meta.url), 'utf8')).toBe(csv);
		const lesson = readFileSync(new URL('../../static/materials/lesson.txt', import.meta.url), 'utf8');
		expect(lesson.length).toBeGreaterThan(400);
		expect(lesson).toContain('Демонстрационный урок');
		expect(lesson).toContain('демо-11');
	});
});
