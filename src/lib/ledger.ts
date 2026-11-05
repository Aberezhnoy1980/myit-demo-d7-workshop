export interface LedgerRow {
	date: string;
	code: string;
	channel: string;
	request: string;
	status: string;
	next: string;
}

/** Синтетические обращения мастерской «Северная полка». Не реальные клиенты. */
export const LEDGER: readonly LedgerRow[] = [
	{
		date: '2026-10-27',
		code: 'демо-01',
		channel: 'телефон',
		request: 'Полка 180 см, срок к выходным',
		status: 'ждёт нас',
		next: 'Назвать демонстрационные срок и цену'
	},
	{
		date: '2026-10-28',
		code: 'демо-02',
		channel: 'почта',
		request: 'Замер ниши перед заказом',
		status: 'ждёт клиента',
		next: 'Дождаться ширины и высоты ниши'
	},
	{
		date: '2026-10-29',
		code: 'демо-03',
		channel: 'мессенджер',
		request: 'Повтор полки, как в прошлом заказе',
		status: 'новое',
		next: 'Открыть переписку и выбрать следующий шаг'
	},
	{
		date: '2026-10-30',
		code: 'демо-04',
		channel: 'форма на сайте',
		request: 'Крючки в прихожую, 6 штук',
		status: 'закрыто',
		next: 'Ничего: заказчик отказался'
	},
	{
		date: '2026-10-31',
		code: 'демо-05',
		channel: 'телефон',
		request: 'Полка над столом, нужен эскиз',
		status: 'ждёт нас',
		next: 'Показать простой эскиз'
	},
	{
		date: '2026-11-02',
		code: 'демо-06',
		channel: 'почта',
		request: 'Доставка уже сделанной полки',
		status: 'закрыто',
		next: 'Ничего: вручение отмечено'
	}
];

export interface LedgerSummary {
	total: number;
	waitingOnUs: number;
	waitingOnClient: number;
	fresh: number;
	closed: number;
}

export function summarize(rows: readonly LedgerRow[]): LedgerSummary {
	return {
		total: rows.length,
		waitingOnUs: rows.filter((row) => row.status === 'ждёт нас').length,
		waitingOnClient: rows.filter((row) => row.status === 'ждёт клиента').length,
		fresh: rows.filter((row) => row.status === 'новое').length,
		closed: rows.filter((row) => row.status === 'закрыто').length
	};
}

function csvCell(value: string): string {
	if (/^[=+\-@\t\r]/.test(value)) {
		return `"${value.replaceAll('"', '""')}"`;
	}
	if (/[",\n\r]/.test(value)) {
		return `"${value.replaceAll('"', '""')}"`;
	}
	return value;
}

export function toCsv(rows: readonly LedgerRow[]): string {
	const header = ['дата', 'шифр', 'канал', 'суть', 'статус', 'следующий шаг'];
	const lines = [
		header.join(','),
		...rows.map((row) =>
			[row.date, row.code, row.channel, row.request, row.status, row.next].map(csvCell).join(',')
		)
	];
	return `\uFEFF${lines.join('\n')}\n`;
}
