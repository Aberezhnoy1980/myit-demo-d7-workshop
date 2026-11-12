/** Общие типы, подписи и правила пробного разбора. Источник: docs/2026-11-11-trainer-content-package.md. */

export type Status = 'new' | 'us' | 'client' | 'closed';

export const STATUS_LABEL: Record<Status, string> = {
	new: 'новое',
	us: 'ждёт нас',
	client: 'ждёт клиента',
	closed: 'закрыто'
};

export type Channel = 'chat' | 'email' | 'call' | 'form';

export const CHANNEL_LABEL: Record<Channel, string> = {
	chat: 'Мессенджер',
	email: 'Почта',
	call: 'Телефон',
	form: 'Форма на сайте'
};

export interface Row {
	id: string;
	who: string;
	task: string;
	channels: string;
	status: Status;
	step: string;
	when: string;
	/** Строка разобрана сегодня. Строки прошлой недели и новые обращения ждут разбора. */
	reviewed: boolean;
}

export interface Message {
	side: 'us' | 'client';
	author: string;
	when: string;
	text: string;
}

export const RULE_TASK = 'Правило 1 · Одна задача — одна строка';
export const RULE_STATUS = 'Правило 2 · Чей ход';
export const RULE_STEP = 'Правило 3 · Шаг и день';
export const RULE_CLOSED = 'Правило 4 · Закрытое не удаляем';
export const RULE_ORDER = [RULE_TASK, RULE_STATUS, RULE_STEP, RULE_CLOSED] as const;

/** Правила разбора — раздел 3 пакета. */
export const RULES: readonly { title: string; text: string; short: string }[] = [
	{
		title: 'Одна задача — одна строка',
		text: 'Задача — то, что можно выполнить или закрыть отдельно от других. Две просьбы — две строки, только если каждую можно выполнить без другой. Шаги одной задачи (замер, расчёт, изготовление), её детали и новые сообщения по ней в любом канале — в ту же строку.',
		short: 'Задача — то, что можно выполнить или закрыть отдельно.'
	},
	{
		title: 'Статус — чей ход',
		text: 'Ждёт нас — клиент ждёт нашего ответа или действия. Ждёт клиента — мы ждём его решения, ответа или материалов. Закрыто — клиент отказался или задача выполнена. Решают факты, а не то, кто написал последним.',
		short: 'Ждём мы, ждёт клиент или задача закрыта.'
	},
	{
		title: 'Шаг — действие и день',
		text: 'Если ход наш — то, чего ждёт клиент. Если ход клиента — день напоминания. День — из обещания, а если его нет — из регламента.',
		short: 'День — из обещания клиенту или из регламента.'
	},
	{
		title: 'Закрытое не удаляем',
		text: 'По закрытым строкам видно, сколько обращений не дошло до заказа и почему.',
		short: 'Видно, сколько обращений не дошло до заказа.'
	}
];

/** Регламент учебной мастерской — не универсальная норма. */
export const REGULATION: readonly string[] = [
	'Ход наш и срок не обещан — делаем сегодня, в день разбора.',
	'Срок обещан — шаг на этот день. Если день уже прошёл — сегодня.',
	'Ход клиента — напоминаем на третий рабочий день после последнего сообщения по задаче.',
	'Полки 60, 90 и 120 см и крючки — по прайсу, цену называем сразу. Полки по размерам клиента считаем по присланным размерам. Если размеров нет — предлагаем замер. Замеры — по средам.'
];

export interface PlanCounts {
	today: number;
	wednesday: number;
	closed: number;
	pending: number;
}

export function countPlan(rows: readonly Row[]): PlanCounts {
	return {
		today: rows.filter((row) => row.reviewed && row.status !== 'closed' && row.when === 'сегодня').length,
		wednesday: rows.filter((row) => row.reviewed && row.when === 'в эту среду').length,
		closed: rows.filter((row) => row.reviewed && row.status === 'closed').length,
		pending: rows.filter((row) => !row.reviewed).length
	};
}
