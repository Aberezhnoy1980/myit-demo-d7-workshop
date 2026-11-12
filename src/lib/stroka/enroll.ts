/**
 * Демо-форма записи в группу (раздел 7.5–7.6 текстового пакета).
 * Только проверка значений в памяти страницы: ничего не отправляется и не сохраняется.
 */

export type ContactType = 'email' | 'telegram' | 'phone';

export interface EnrollInput {
	name: string;
	contactType: ContactType;
	contact: string;
	occupation: string;
	volume: string;
}

export type EnrollErrors = Partial<Record<'name' | 'contact', string>>;

export const CONTACT_TYPES: readonly { id: ContactType; label: string; field: string; hint: string }[] = [
	{ id: 'email', label: 'Почта', field: 'Адрес почты', hint: 'Например, name@example.ru' },
	{ id: 'telegram', label: 'Telegram', field: 'Имя в Telegram', hint: 'От 5 символов, можно с @ в начале' },
	{ id: 'phone', label: 'Телефон', field: 'Телефон', hint: '10–15 цифр, можно с + в начале' }
];

export const OCCUPATIONS: readonly { id: string; label: string }[] = [
	{ id: 'workshop', label: 'Мастерская: мебель и изделия на заказ' },
	{ id: 'repair', label: 'Ремонт и пошив' },
	{ id: 'studio', label: 'Фото- или видеостудия' },
	{ id: 'cabinet', label: 'Кабинет мастера' },
	{ id: 'other', label: 'Другое' }
];

export const VOLUMES: readonly { id: string; label: string }[] = [
	{ id: 'lt10', label: 'до 10' },
	{ id: '10-30', label: '10–30' },
	{ id: 'gt30', label: 'больше 30' },
	{ id: 'unknown', label: 'не знаю' }
];

export const EMPTY_ENROLL: EnrollInput = {
	name: '',
	contactType: 'email',
	contact: '',
	occupation: '',
	volume: ''
};

/** Демо-данные: вымышленная участница, адрес в зарезервированном домене .example. */
export const DEMO_ENROLL: EnrollInput = {
	name: 'Ирина',
	contactType: 'email',
	contact: 'irina@polka.example',
	occupation: 'workshop',
	volume: '10-30'
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM = /^@?[A-Za-z0-9_]{5,32}$/;
const PHONE_CHARS = /^\+?[\d\s()-]+$/;

export function validateEnroll(input: EnrollInput): EnrollErrors {
	const errors: EnrollErrors = {};
	const name = input.name.trim();
	if (name.length === 0) errors.name = 'Напишите имя — так ведущий обратится к вам.';
	else if (name.length > 60) errors.name = 'Имя длиннее 60 символов — сократите.';

	const contact = input.contact.trim();
	if (input.contactType === 'email') {
		if (!EMAIL.test(contact)) errors.contact = 'Проверьте адрес: нужны знак @ и домен.';
	} else if (input.contactType === 'telegram') {
		if (!TELEGRAM.test(contact))
			errors.contact = 'Имя в Telegram — от 5 символов: латиница, цифры, подчёркивание; можно с @ в начале.';
	} else {
		const digits = contact.replace(/\D/g, '').length;
		if (!PHONE_CHARS.test(contact) || digits < 10 || digits > 15)
			errors.contact = 'Телефон — 10–15 цифр, можно с + в начале.';
	}
	return errors;
}

/** Строка экрана участника о том, куда придут варианты даты. */
export function deliveryLine(input: EnrollInput): string {
	const contact = input.contact.trim();
	if (input.contactType === 'email') return `на ${contact} придёт письмо с вариантами даты`;
	if (input.contactType === 'telegram') {
		const handle = contact.startsWith('@') ? contact : `@${contact}`;
		return `в Telegram ${handle} придёт сообщение с вариантами даты`;
	}
	return `на номер ${contact} придёт сообщение с вариантами даты`;
}
