import { DEMO_EVENT } from './event';

const encoder = new TextEncoder();

/** Экранирование TEXT по RFC 5545: обратная косая, перевод строки, точка с запятой, запятая. */
export function escapeIcsText(value: string): string {
	return value
		.replaceAll('\\', '\\\\')
		.replaceAll(/\r\n|\n|\r/g, '\\n')
		.replaceAll(';', '\\;')
		.replaceAll(',', '\\,');
}

function foldLine(line: string): string {
	if (encoder.encode(line).length <= 75) return line;
	const chunks: string[] = [];
	let piece = '';
	let pieceBytes = 0;
	let budget = 75;
	for (const char of line) {
		const size = encoder.encode(char).length;
		if (piece && pieceBytes + size > budget) {
			chunks.push(piece);
			piece = char;
			pieceBytes = size;
			budget = 74;
		} else {
			piece += char;
			pieceBytes += size;
		}
	}
	if (piece) chunks.push(piece);
	return chunks.map((chunk, index) => (index === 0 ? chunk : ` ${chunk}`)).join('\r\n');
}

function textLine(name: string, value: string): string {
	return foldLine(`${name}:${escapeIcsText(value)}`);
}

/** Стабильный демонстрационный файл. Сам в календарь ничего не добавляет. */
export function buildDemoCalendar(): string {
	const rows = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//myit//d7-workshop demo//RU',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VTIMEZONE',
		'TZID:Europe/Moscow',
		'BEGIN:STANDARD',
		'DTSTART:20141026T020000',
		'TZOFFSETFROM:+0300',
		'TZOFFSETTO:+0300',
		'TZNAME:MSK',
		'END:STANDARD',
		'END:VTIMEZONE',
		'BEGIN:VEVENT',
		`UID:${DEMO_EVENT.uid}`,
		`DTSTAMP:${DEMO_EVENT.dtstamp}`,
		`DTSTART;TZID=${DEMO_EVENT.timezone}:${DEMO_EVENT.start}`,
		`DTEND;TZID=${DEMO_EVENT.timezone}:${DEMO_EVENT.end}`,
		textLine('SUMMARY', DEMO_EVENT.summary),
		textLine('DESCRIPTION', DEMO_EVENT.description),
		textLine('LOCATION', DEMO_EVENT.location),
		'STATUS:TENTATIVE',
		'END:VEVENT',
		'END:VCALENDAR'
	];
	return `${rows.join('\r\n')}\r\n`;
}
