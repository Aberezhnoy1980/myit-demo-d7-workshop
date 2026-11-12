import { STATUS_LABEL, type Row } from './model';

/**
 * Ячейка CSV. Значения, которые табличный редактор может принять за формулу, получают апостроф в начале:
 * одних кавычек для этого недостаточно.
 */
export function safeCsvCell(value: string): string {
	const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
	return /[",\n\r;']/.test(guarded) ? `"${guarded.replaceAll('"', '""')}"` : guarded;
}

export const TASK_CSV_HEADER = ['Кто', 'Задача', 'Каналы', 'Статус', 'Следующий шаг', 'Когда'];

function toCsv(lines: readonly (readonly string[])[]): string {
	return `﻿${lines.map((line) => line.map(safeCsvCell).join(',')).join('\r\n')}\r\n`;
}

/** Итоговая таблица разбора — те же строки, что на экране и в листе. */
export function tasksCsv(rows: readonly Row[]): string {
	return toCsv([
		TASK_CSV_HEADER,
		...rows.map((row) => [row.who, row.task, row.channels, STATUS_LABEL[row.status], row.step, row.when])
	]);
}

/** Пустой шаблон для своих обращений: заголовок, строка-пример, десять пустых строк. Данных формы здесь нет. */
export function templateCsv(): string {
	const empty = TASK_CSV_HEADER.map(() => '');
	return toCsv([
		TASK_CSV_HEADER,
		['Пример: Имя', 'Что просит', 'мессенджер', 'ждёт нас', 'Что сделать', 'сегодня'],
		...Array.from({ length: 10 }, () => empty)
	]);
}

export const TASKS_CSV_NAME = 'таблица-северная-полка.csv';
export const TEMPLATE_CSV_NAME = 'шаблон-моя-неделя.csv';
