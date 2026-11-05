import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DEMO_EVENT } from './event';
import { buildDemoCalendar, escapeIcsText } from './ics';

describe('ics', () => {
	it('escapes commas, semicolons, newlines and backslashes', () => {
		expect(escapeIcsText('a, b; c\nd\\e')).toBe('a\\, b\\; c\\nd\\\\e');
	});

	it('builds a stable DEMO event in Europe/Moscow', () => {
		const calendar = buildDemoCalendar();
		expect(calendar).toContain('BEGIN:VCALENDAR');
		expect(calendar).toContain('BEGIN:VEVENT');
		expect(calendar).toContain(`UID:${DEMO_EVENT.uid}`);
		expect(calendar).toContain('TZID:Europe/Moscow');
		expect(calendar).toContain('DTSTART;TZID=Europe/Moscow:20261118T110000');
		expect(DEMO_EVENT.displayTime).toBe('11:00–11:40');
		expect(DEMO_EVENT.end).toBe('20261118T114000');
		expect(calendar).toContain('DTEND;TZID=Europe/Moscow:20261118T114000');
		expect(calendar).not.toContain('T133000');
		expect(calendar).toContain('SUMMARY:DEMO:');
		expect(calendar).toContain('DESCRIPTION:DEMO.');
		expect(calendar).toContain('LOCATION:Демонстрация\\, онлайн');
		expect(calendar).toContain('STATUS:TENTATIVE');
		expect(calendar.endsWith('END:VCALENDAR\r\n')).toBe(true);
		for (const row of calendar.split('\r\n')) {
			expect(new TextEncoder().encode(row).length).toBeLessThanOrEqual(75);
		}
		expect(readFileSync(new URL('../../static/materials/workshop-demo.ics', import.meta.url), 'utf8')).toBe(calendar);
	});
});
