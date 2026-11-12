import { describe, expect, it } from 'vitest';
import { CASES, INITIAL_ROWS } from './cases';
import { TASK_CSV_HEADER, safeCsvCell, tasksCsv, templateCsv } from './csv';
import {
	TOTAL_QUESTIONS,
	answer,
	currentCase,
	currentQuestion,
	next,
	questionNumber,
	results,
	solveAll,
	start,
	type TrainerState
} from './engine';
import { FINAL_ROWS } from './sample';
import { RULE_STATUS, RULE_STEP, RULE_TASK, countPlan } from './model';

const correctId = (state: TrainerState) => currentQuestion(state).options.find((o) => o.correct)!.id;
const wrongIds = (state: TrainerState) => currentQuestion(state).options.filter((o) => !o.correct).map((o) => o.id);

/** Проходит разбор; для вопросов из wrongFirst сначала даёт указанные неверные ответы. */
function run(wrongFirst: Record<string, string[]> = {}): TrainerState {
	let state = start();
	while (!state.finished) {
		for (const id of wrongFirst[currentQuestion(state).id] ?? []) state = answer(state, id);
		state = next(answer(state, correctId(state)));
	}
	return state;
}

/** Итоговая таблица из раздела 5.1 текстового пакета. */
const PACKAGE_TABLE = [
	['Ольга', 'Полка в нишу 84×210', 'мессенджер', 'us', 'Посчитать и назвать срок и цену', 'сегодня'],
	['Дмитрий', 'Стеллаж 80 см', 'почта, форма на сайте', 'closed', 'Заказал в другом месте', '—'],
	['Анна', 'Полка 90 см', 'мессенджер, телефон', 'us', 'Перезвонить, подтвердить, что берёмся, и назвать цену', 'сегодня'],
	['Сергей', 'Полка 120 см из дуба', 'почта', 'client', 'Напомнить о расчёте', 'в эту среду'],
	['Марина', 'Полка над столом во всю стену', 'мессенджер', 'us', 'Предложить замер в эту среду', 'сегодня'],
	['Марина', 'Крючки в прихожую, 6 шт.', 'мессенджер', 'us', 'Назвать цену', 'сегодня']
];

describe('содержание разбора', () => {
	it('шесть обращений в порядке пакета и 13 вопросов', () => {
		expect(CASES.map((c) => c.who)).toEqual(['Анна', 'Сергей', 'Ольга', 'Дмитрий', 'Марина', 'Анна']);
		expect(CASES.map((c) => c.questions.length)).toEqual([2, 2, 2, 2, 3, 2]);
		expect(TOTAL_QUESTIONS).toBe(13);
	});

	it('у каждого вопроса ровно один верный вариант; пояснение и правило есть у каждого варианта', () => {
		for (const item of CASES) {
			for (const question of item.questions) {
				expect(question.options.filter((o) => o.correct), question.id).toHaveLength(1);
				expect(question.consider.length, question.id).toBeGreaterThan(0);
				for (const option of question.options) {
					expect(option.feedback.length, `${question.id}/${option.id}`).toBeGreaterThan(20);
					expect(option.rule).toMatch(/^Правило \d · /);
				}
			}
		}
	});

	it('«новое» никогда не бывает вариантом ответа', () => {
		const statuses = CASES.flatMap((c) => c.questions.flatMap((q) => q.options.map((o) => o.status)));
		expect(statuses).not.toContain('new');
	});

	it('разбор начинается с двух строк прошлой недели: Ольга и Дмитрий ждут клиента', () => {
		expect(INITIAL_ROWS.map((r) => [r.who, r.status, r.reviewed])).toEqual([
			['Ольга', 'client', false],
			['Дмитрий', 'client', false]
		]);
	});

	it('в материалах нет календарных дат', () => {
		const text = JSON.stringify({ CASES, INITIAL_ROWS });
		expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}/);
		expect(text).not.toMatch(/\d{1,2} (января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/);
	});

	it('Сергею названы и цена, и срок; Дмитрий оценивается по задаче, Анна — по прямой просьбе', () => {
		expect(CASES[1].messages[1].text).toMatch(/цену.*срок/);
		const dmitryUs = CASES[3].questions[0].options.find((o) => o.id === 'us')!;
		expect(dmitryUs.feedback).toMatch(/задачу по заказу/);
		expect(dmitryUs.feedback).toMatch(/Вежливо ответить можно/);
		const annaMessage = CASES[5].questions[1].options.find((o) => o.id === 'message')!;
		expect(annaMessage.feedback).toMatch(/не в том, что звонок лучше/);
	});
});

describe('прохождение', () => {
	it('верные ответы дают итоговую таблицу из пакета', () => {
		const final = solveAll().rows;
		expect(final.map((r) => [r.who, r.task, r.channels, r.status, r.step, r.when])).toEqual(PACKAGE_TABLE);
		expect(final.every((r) => r.reviewed)).toBe(true);
		expect(FINAL_ROWS).toEqual(final);
	});

	it('итог: 4 дела на сегодня, 1 на среду, 1 закрыто, ничего не ждёт разбора', () => {
		expect(countPlan(solveAll().rows)).toEqual({ today: 4, wednesday: 1, closed: 1, pending: 0 });
	});

	it('у Анны одна строка на мессенджер и звонок, у Марины — две', () => {
		const final = solveAll().rows;
		expect(final.filter((r) => r.who === 'Анна')).toHaveLength(1);
		expect(final.filter((r) => r.who === 'Марина').map((r) => r.task)).toEqual([
			'Полка над столом во всю стену',
			'Крючки в прихожую, 6 шт.'
		]);
	});

	it('таблица меняется по ходу: новые строки начинают как «новое», звонок возвращает Анну в разбор', () => {
		let state = start();
		expect(state.rows.find((r) => r.id === 'anna')).toMatchObject({ status: 'new', reviewed: false });
		// До пятого обращения таблица по шагам: после О1 у Анны «ждёт нас».
		state = next(answer(state, correctId(state)));
		state = next(answer(state, correctId(state)));
		expect(currentCase(state).id).toBe('o2');
		expect(state.rows.find((r) => r.id === 'anna')).toMatchObject({ status: 'us', when: 'сегодня', reviewed: true });
		expect(state.rows.find((r) => r.id === 'sergey')).toMatchObject({ status: 'new' });
		while (currentCase(state).id !== 'o6') state = next(answer(state, correctId(state)));
		expect(state.rows.find((r) => r.id === 'anna')).toMatchObject({ reviewed: false, channels: 'мессенджер' });
		expect(countPlan(state.rows).pending).toBe(1);
	});

	it('строка Марины делится только после верного ответа на вопрос о числе строк', () => {
		let state = start();
		while (currentCase(state).id !== 'o5') state = next(answer(state, correctId(state)));
		expect(state.rows.filter((r) => r.who === 'Марина').map((r) => r.status)).toEqual(['new']);
		state = answer(state, 'one');
		expect(state.rows.filter((r) => r.who === 'Марина')).toHaveLength(1);
		state = answer(state, 'two');
		expect(state.rows.filter((r) => r.who === 'Марина').map((r) => r.status)).toEqual(['us', 'us']);
	});

	it('неверный ответ не меняет таблицу и не пускает дальше', () => {
		const state = start();
		const after = answer(state, wrongIds(state)[0]);
		expect(after.rows).toEqual(state.rows);
		expect(after.solved).toBe(false);
		expect(next(after)).toBe(after);
	});

	it('номер вопроса идёт сквозной от 1 до 13', () => {
		let state = start();
		const numbers: number[] = [];
		while (!state.finished) {
			numbers.push(questionNumber(state));
			state = next(answer(state, correctId(state)));
		}
		expect(numbers).toEqual(Array.from({ length: 13 }, (_, i) => i + 1));
	});
});

describe('учёт ошибок', () => {
	it('без ошибок: 13 из 13, список пуст', () => {
		const r = results(run());
		expect(r).toMatchObject({ total: 13, firstCorrect: 13, mistakes: [] });
		expect(r.byRule.every((x) => x.count === 0)).toBe(true);
	});

	it('несколько неверных попыток в одном вопросе — одна ошибка, записан первый ответ', () => {
		const r = results(run({ 'o3-status': ['closed', 'client'] }));
		expect(r.firstCorrect).toBe(12);
		expect(r.mistakes).toHaveLength(1);
		expect(r.mistakes[0].first.id).toBe('closed');
		expect(r.mistakes[0].correct.id).toBe('us');
	});

	it('верный ответ после ошибки не стирает первую ошибку', () => {
		let state = start();
		state = answer(state, 'client');
		state = answer(state, 'us');
		state = answer(state, 'closed');
		expect(state.firstAnswers['o1-status']).toBe('client');
		expect(results(state).mistakes.map((m) => m.question.id)).toEqual(['o1-status']);
	});

	it('ошибки в разных правилах считаются по основному правилу вопроса', () => {
		const r = results(
			run({
				'o1-step': ['answer-wed'],
				'o2-status': ['us'],
				'o2-step': ['remind-today'],
				'o3-status': ['client'],
				'o5-rows': ['one'],
				'o5-hooks': ['after-measure'],
				'o6-where': ['new-row']
			})
		);
		expect(r.firstCorrect).toBe(6);
		const counts = Object.fromEntries(r.byRule.map((x) => [x.rule, x.count]));
		expect(counts[RULE_TASK]).toBe(2);
		expect(counts[RULE_STATUS]).toBe(2);
		expect(counts[RULE_STEP]).toBe(3);
		expect(r.mistakes.map((m) => m.caseTitle)).toContain('Сергей · полка 120 см из дуба');
	});

	it('ошибки не меняют итоговую таблицу', () => {
		expect(run({ 'o1-status': ['client'], 'o5-rows': ['three', 'one'] }).rows).toEqual(solveAll().rows);
	});

	it('новый старт полностью сбрасывает результат', () => {
		const done = run({ 'o1-status': ['client'] });
		expect(done.finished).toBe(true);
		const fresh = start();
		expect(fresh).toMatchObject({ caseIndex: 0, questionIndex: 0, finished: false, solved: false, tried: [], firstAnswers: {} });
		expect(results(fresh)).toMatchObject({ firstCorrect: 0, mistakes: [] });
	});
});

describe('CSV', () => {
	const parse = (csv: string) =>
		csv
			.replace(/^﻿/, '')
			.trimEnd()
			.split('\r\n');

	it('итоговая таблица: BOM, заголовок, шесть строк в порядке экрана', () => {
		const csv = tasksCsv(FINAL_ROWS);
		expect(csv.startsWith('﻿')).toBe(true);
		const lines = parse(csv);
		expect(lines[0]).toBe(TASK_CSV_HEADER.join(','));
		expect(lines).toHaveLength(7);
		expect(lines[3]).toBe('Анна,Полка 90 см,"мессенджер, телефон",ждёт нас,"Перезвонить, подтвердить, что берёмся, и назвать цену",сегодня');
		expect(lines[2]).toBe('Дмитрий,Стеллаж 80 см,"почта, форма на сайте",закрыто,Заказал в другом месте,—');
	});

	it('значения, похожие на формулы, не исполняются; кавычки экранируются', () => {
		expect(safeCsvCell('=1+1')).toBe(`"'=1+1"`);
		expect(safeCsvCell('+7 900')).toBe(`"'+7 900"`);
		expect(safeCsvCell('-5')).toBe(`"'-5"`);
		expect(safeCsvCell('@cmd')).toBe(`"'@cmd"`);
		expect(safeCsvCell('Полка «Север» "дуб"')).toBe('"Полка «Север» ""дуб"""');
		expect(safeCsvCell('—')).toBe('—');
	});

	it('шаблон: заголовок, пример и десять пустых строк, без данных разбора и формы', () => {
		const lines = parse(templateCsv());
		expect(lines[0]).toBe(TASK_CSV_HEADER.join(','));
		expect(lines[1]).toMatch(/^Пример/);
		expect(lines.slice(2)).toEqual(Array(10).fill(',,,,,'));
		expect(templateCsv()).not.toMatch(/Ольга|Анна|Ирина|@/);
	});
});
