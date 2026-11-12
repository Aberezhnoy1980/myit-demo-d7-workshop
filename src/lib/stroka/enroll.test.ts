import { describe, expect, it } from 'vitest';
import { DEMO_ENROLL, EMPTY_ENROLL, deliveryLine, validateEnroll, type EnrollInput } from './enroll';

const withContact = (contactType: EnrollInput['contactType'], contact: string): EnrollInput => ({
	...DEMO_ENROLL,
	contactType,
	contact
});

describe('демо-форма записи', () => {
	it('демо-данные проходят проверку, пустая форма — нет', () => {
		expect(validateEnroll(DEMO_ENROLL)).toEqual({});
		expect(Object.keys(validateEnroll(EMPTY_ENROLL)).sort()).toEqual(['contact', 'name']);
	});

	it('имя: пробелы не считаются, больше 60 символов — ошибка', () => {
		expect(validateEnroll({ ...DEMO_ENROLL, name: '   ' }).name).toMatch(/Напишите имя/);
		expect(validateEnroll({ ...DEMO_ENROLL, name: 'а'.repeat(61) }).name).toMatch(/60/);
		expect(validateEnroll({ ...DEMO_ENROLL, name: 'а'.repeat(60) }).name).toBeUndefined();
	});

	it('контакт проверяется по выбранному способу связи', () => {
		expect(validateEnroll(withContact('email', 'irina@polka')).contact).toMatch(/@/);
		expect(validateEnroll(withContact('telegram', '@polka_demo')).contact).toBeUndefined();
		expect(validateEnroll(withContact('telegram', 'abc')).contact).toBeDefined();
		expect(validateEnroll(withContact('phone', '+7 (900) 000-00-00')).contact).toBeUndefined();
		expect(validateEnroll(withContact('phone', '12345')).contact).toBeDefined();
		expect(validateEnroll(withContact('phone', 'irina@polka.example')).contact).toBeDefined();
	});

	it('строка экрана участника зависит от способа связи', () => {
		expect(deliveryLine(DEMO_ENROLL)).toBe('на irina@polka.example придёт письмо с вариантами даты');
		expect(deliveryLine(withContact('telegram', 'polka_demo'))).toBe(
			'в Telegram @polka_demo придёт сообщение с вариантами даты'
		);
		expect(deliveryLine(withContact('phone', '+7 900 000-00-00'))).toBe(
			'на номер +7 900 000-00-00 придёт сообщение с вариантами даты'
		);
	});
});
