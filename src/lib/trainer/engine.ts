/**
 * Движок пробного разбора: чистые функции без хранилища. Состояние живёт только в памяти страницы.
 */
import { CASES, INITIAL_ROWS, type Case, type Effect, type Option, type Question } from './cases';
import { RULE_ORDER, type Row } from './model';

export interface TrainerState {
	caseIndex: number;
	questionIndex: number;
	/** Таблица сейчас. */
	rows: readonly Row[];
	/** Таблица до открытия текущего обращения — для подписи «было». */
	caseStartRows: readonly Row[];
	/** Варианты, выбранные в текущем вопросе. */
	tried: readonly string[];
	solved: boolean;
	/** Первый ответ на каждый вопрос: по нему считаются ошибки. */
	firstAnswers: Readonly<Record<string, string>>;
	finished: boolean;
}

export const TOTAL_QUESTIONS = CASES.reduce((sum, item) => sum + item.questions.length, 0);

export function applyEffects(rows: readonly Row[], effects: readonly Effect[]): Row[] {
	let next = rows.slice();
	for (const effect of effects) {
		if (effect.kind === 'add') {
			if (next.some((row) => row.id === effect.row.id)) throw new Error(`Строка ${effect.row.id} уже есть`);
			next.push({ ...effect.row });
		} else if (effect.kind === 'remove') {
			next = next.filter((row) => row.id !== effect.rowId);
		} else {
			if (!next.some((row) => row.id === effect.rowId)) throw new Error(`Нет строки ${effect.rowId}`);
			next = next.map((row) => (row.id === effect.rowId ? { ...row, ...effect.patch } : row));
		}
	}
	return next;
}

export function start(): TrainerState {
	return {
		caseIndex: 0,
		questionIndex: 0,
		rows: applyEffects(INITIAL_ROWS, CASES[0].enter),
		caseStartRows: INITIAL_ROWS.slice(),
		tried: [],
		solved: false,
		firstAnswers: {},
		finished: false
	};
}

export function currentCase(state: TrainerState): Case {
	return CASES[state.caseIndex];
}

export function currentQuestion(state: TrainerState): Question {
	return CASES[state.caseIndex].questions[state.questionIndex];
}

/** Порядковый номер текущего вопроса во всём разборе, с единицы. */
export function questionNumber(state: TrainerState): number {
	let n = 0;
	for (let i = 0; i < state.caseIndex; i++) n += CASES[i].questions.length;
	return n + state.questionIndex + 1;
}

export function findOption(question: Question, optionId: string): Option {
	const option = question.options.find((item) => item.id === optionId);
	if (!option) throw new Error(`Нет варианта ${optionId} в вопросе ${question.id}`);
	return option;
}

/** Ответ на текущий вопрос. После верного ответа повторные выборы игнорируются. */
export function answer(state: TrainerState, optionId: string): TrainerState {
	if (state.finished || state.solved) return state;
	const question = currentQuestion(state);
	const option = findOption(question, optionId);
	const firstAnswers =
		question.id in state.firstAnswers ? state.firstAnswers : { ...state.firstAnswers, [question.id]: option.id };
	const tried = state.tried.includes(option.id) ? state.tried : [...state.tried, option.id];
	if (!option.correct) return { ...state, firstAnswers, tried };
	return { ...state, firstAnswers, tried, solved: true, rows: applyEffects(state.rows, question.effects) };
}

/** Переход к следующему вопросу или обращению; только после верного ответа. */
export function next(state: TrainerState): TrainerState {
	if (state.finished || !state.solved) return state;
	const current = CASES[state.caseIndex];
	if (state.questionIndex < current.questions.length - 1) {
		return { ...state, questionIndex: state.questionIndex + 1, tried: [], solved: false };
	}
	if (state.caseIndex < CASES.length - 1) {
		const upcoming = CASES[state.caseIndex + 1];
		return {
			...state,
			caseIndex: state.caseIndex + 1,
			questionIndex: 0,
			caseStartRows: state.rows,
			rows: applyEffects(state.rows, upcoming.enter),
			tried: [],
			solved: false
		};
	}
	return { ...state, finished: true, tried: [], solved: false };
}

export interface Mistake {
	caseTitle: string;
	question: Question;
	first: Option;
	correct: Option;
}

export interface Results {
	total: number;
	firstCorrect: number;
	mistakes: Mistake[];
	byRule: { rule: string; count: number }[];
}

export function results(state: TrainerState): Results {
	const mistakes: Mistake[] = [];
	let answered = 0;
	for (const item of CASES) {
		for (const question of item.questions) {
			const firstId = state.firstAnswers[question.id];
			if (!firstId) continue;
			answered++;
			const first = findOption(question, firstId);
			if (!first.correct) {
				mistakes.push({ caseTitle: item.title, question, first, correct: question.options.find((o) => o.correct)! });
			}
		}
	}
	return {
		total: TOTAL_QUESTIONS,
		firstCorrect: answered - mistakes.length,
		mistakes,
		byRule: RULE_ORDER.map((rule) => ({ rule, count: mistakes.filter((m) => m.question.rule === rule).length }))
	};
}

/** Прохождение верными ответами: итоговая таблица одинакова у всех. */
export function solveAll(): TrainerState {
	let state = start();
	while (!state.finished) {
		const question = currentQuestion(state);
		state = next(answer(state, question.options.find((o) => o.correct)!.id));
	}
	return state;
}
