/**
 * Шесть обращений учебной недели, 13 вопросов. Источник: docs/2026-11-11-trainer-content-package.md, раздел 4.
 * Таблица меняется только через эффекты верных ответов и эффекты начала обращения.
 */
import {
	RULE_CLOSED,
	RULE_STATUS,
	RULE_STEP,
	RULE_TASK,
	type Channel,
	type Message,
	type Row,
	type Status
} from './model';

export type Effect =
	| { kind: 'add'; row: Row }
	| { kind: 'update'; rowId: string; patch: Partial<Omit<Row, 'id'>> }
	| { kind: 'remove'; rowId: string };

export interface Option {
	id: string;
	label: string;
	/** Статус, который показывает вариант; только для вопросов «Чей ход?». */
	status?: Status;
	short?: string;
	correct: boolean;
	feedback: string;
	rule: string;
}

export interface Question {
	id: string;
	prompt: string;
	/** Основное правило вопроса — по нему считаются ошибки. */
	rule: string;
	consider: readonly string[];
	options: readonly Option[];
	effects: readonly Effect[];
	change: string;
}

export interface Case {
	id: string;
	title: string;
	channel: Channel;
	who: string;
	messages: readonly Message[];
	note?: string;
	/** Эффекты при открытии обращения: новая строка в статусе «новое» или новый канал. */
	enter: readonly Effect[];
	/** Строки, которые подсвечиваются в таблице. */
	focus: readonly string[];
	questions: readonly Question[];
}

const NOT_YET = 'Шаг не выбран';

const STATUS_CONSIDER = [
	'Ждёт нас — клиент ждёт нашего ответа или действия. Ждёт клиента — мы ждём его решения, ответа или материалов. Закрыто — отказ или задача выполнена.',
	'Решают факты переписки, а не то, кто написал последним.'
];

function statusOptions(
	feedback: Record<'us' | 'client' | 'closed', string>,
	correct: 'us' | 'client' | 'closed'
): Option[] {
	return [
		{ id: 'us', label: 'Наш — ждёт нас', status: 'us', short: 'ход наш', correct: correct === 'us', feedback: feedback.us, rule: RULE_STATUS },
		{ id: 'client', label: 'Клиента — ждёт клиента', status: 'client', short: 'ход клиента', correct: correct === 'client', feedback: feedback.client, rule: RULE_STATUS },
		{ id: 'closed', label: 'Ничей — закрыто', status: 'closed', short: 'ход ничей', correct: correct === 'closed', feedback: feedback.closed, rule: RULE_STATUS }
	];
}

/** Таблица в начале разбора: две строки с прошлого понедельника. */
export const INITIAL_ROWS: readonly Row[] = [
	{ id: 'olga', who: 'Ольга', task: 'Полка в нишу', channels: 'мессенджер', status: 'client', step: 'Напомнить про размеры', when: 'прошлый чт', reviewed: false },
	{ id: 'dmitry', who: 'Дмитрий', task: 'Стеллаж 80 см', channels: 'почта', status: 'client', step: 'Напомнить о расчёте', when: 'прошлый чт', reviewed: false }
];

export const CASES: readonly Case[] = [
	{
		id: 'o1',
		title: 'Анна · полка 90 см',
		channel: 'chat',
		who: 'Анна',
		messages: [
			{ side: 'client', author: 'Анна', when: 'прошлая пятница, 21:40', text: 'Здравствуйте! Полку 90 см сделаете? Сколько будет стоить?' }
		],
		note: 'Ответа не было. Новая клиентка — в таблице её ещё нет.',
		enter: [
			{ kind: 'add', row: { id: 'anna', who: 'Анна', task: 'Полка 90 см', channels: 'мессенджер', status: 'new', step: NOT_YET, when: '—', reviewed: false } }
		],
		focus: ['anna'],
		questions: [
			{
				id: 'o1-status',
				prompt: 'Чей сейчас ход?',
				rule: RULE_STATUS,
				consider: STATUS_CONSIDER,
				options: statusOptions(
					{
						us: 'Анна задала вопрос и ждёт ответа. Пока мы не ответили, ход наш.',
						client: 'Мы Анне ещё ничего не писали — ждать от неё нечего.',
						closed: 'Анна не отказалась, и задача не выполнена. Закрывают только в этих двух случаях.'
					},
					'us'
				),
				effects: [{ kind: 'update', rowId: 'anna', patch: { status: 'us' } }],
				change: 'Статус: новое → ждёт нас'
			},
			{
				id: 'o1-step',
				prompt: 'Следующий шаг и срок?',
				rule: RULE_STEP,
				consider: [
					'Шаг — действие и день. Если ход наш — то, чего ждёт клиент.',
					'Регламент 1. Ход наш и срок не обещан — делаем сегодня.',
					'Регламент 4. Полки 60, 90 и 120 см — по прайсу, цену называем сразу.'
				],
				options: [
					{ id: 'answer-today', label: 'Ответить, что берёмся, и назвать цену — сегодня', correct: true, feedback: 'Полка 90 см есть в прайсе, считать не нужно (регламент 4). Ход наш, срок не обещан — сегодня (регламент 1).', rule: RULE_STEP },
					{ id: 'answer-wed', label: 'Ответить и назвать цену — в эту среду', correct: false, feedback: 'Среду Анне не обещали, а регламент 1 ставит ответ на сегодня.', rule: RULE_STEP },
					{ id: 'wait', label: 'Подождать, вдруг напишет ещё раз', correct: false, feedback: 'Ход наш. Ожидание оставляет вопрос Анны без ответа.', rule: RULE_STEP }
				],
				effects: [{ kind: 'update', rowId: 'anna', patch: { step: 'Ответить, что берёмся, и назвать цену', when: 'сегодня', reviewed: true } }],
				change: 'Шаг: ответить, что берёмся, и назвать цену — сегодня'
			}
		]
	},
	{
		id: 'o2',
		title: 'Сергей · полка 120 см из дуба',
		channel: 'email',
		who: 'Сергей',
		messages: [
			{ side: 'client', author: 'Сергей', when: 'прошлый вторник', text: 'Добрый день! Сколько будет стоить полка 120 см из дуба и сколько её делать?' },
			{ side: 'us', author: 'Вы', when: 'прошлый вторник', text: 'Ответили в тот же день: назвали цену полки по прайсу и срок изготовления — 10 рабочих дней.' },
			{ side: 'client', author: 'Сергей', when: 'прошлая пятница', text: 'Спасибо, я подумаю.' }
		],
		note: 'Сумма для разбора не нужна, поэтому в письме не показана.',
		enter: [
			{ kind: 'add', row: { id: 'sergey', who: 'Сергей', task: 'Полка 120 см из дуба', channels: 'почта', status: 'new', step: NOT_YET, when: '—', reviewed: false } }
		],
		focus: ['sergey'],
		questions: [
			{
				id: 'o2-status',
				prompt: 'Чей сейчас ход?',
				rule: RULE_STATUS,
				consider: STATUS_CONSIDER,
				options: statusOptions(
					{
						us: 'Последним написал Сергей, но он ничего не спросил и не попросил. Решают факты, а не то, кто написал последним.',
						client: 'Мы назвали и цену, и срок — ответили на оба вопроса. Сергей сам сказал, что решает. Ждём его решения.',
						closed: '«Подумаю» — не отказ. Закрывают, когда клиент отказался прямо или задача выполнена.'
					},
					'client'
				),
				effects: [{ kind: 'update', rowId: 'sergey', patch: { status: 'client' } }],
				change: 'Статус: новое → ждёт клиента'
			},
			{
				id: 'o2-step',
				prompt: 'Следующий шаг и срок?',
				rule: RULE_STEP,
				consider: [
					'Если ход у клиента, шаг — это день напоминания.',
					'Регламент 3. Ход клиента — напоминаем на третий рабочий день после последнего сообщения по задаче.',
					'Сейчас понедельник. Рабочие дни — с понедельника по пятницу.'
				],
				options: [
					{ id: 'remind-wed', label: 'Напомнить о расчёте — в эту среду', correct: true, feedback: 'Регламент 3: третий рабочий день после последнего сообщения. Сергей написал в пятницу: понедельник — первый, вторник — второй, среда — третий.', rule: RULE_STEP },
					{ id: 'remind-today', label: 'Напомнить о расчёте — сегодня', correct: false, feedback: 'Сегодня — только первый рабочий день после его письма, а регламент 3 называет третий.', rule: RULE_STEP },
					{ id: 'nothing', label: 'Ничего не ставить, пока сам не напишет', correct: false, feedback: 'У строки «ждёт клиента» всегда есть день напоминания, иначе она повиснет.', rule: RULE_STEP }
				],
				effects: [{ kind: 'update', rowId: 'sergey', patch: { step: 'Напомнить о расчёте', when: 'в эту среду', reviewed: true } }],
				change: 'Шаг: напомнить о расчёте — в эту среду'
			}
		]
	},
	{
		id: 'o3',
		title: 'Ольга · полка в нишу',
		channel: 'chat',
		who: 'Ольга',
		messages: [
			{ side: 'us', author: 'Вы', when: 'прошлый понедельник', text: 'Ольга, пришлите, пожалуйста, ширину и высоту ниши — посчитаю и отвечу на следующий рабочий день.' },
			{ side: 'client', author: 'Ольга', when: 'прошлый четверг, 14:12', text: 'Вот размеры ниши: 84 на 210.' }
		],
		enter: [],
		focus: ['olga'],
		questions: [
			{
				id: 'o3-status',
				prompt: 'Чей сейчас ход?',
				rule: RULE_STATUS,
				consider: STATUS_CONSIDER,
				options: statusOptions(
					{
						us: 'Ольга прислала то, о чём мы просили, и ждёт расчёта. Ход вернулся к нам.',
						client: 'Так было до четверга. Со старым статусом строка ждёт человека, который уже ответил.',
						closed: 'Ольга не отказалась, и задача не выполнена. Закрывают только в этих двух случаях.'
					},
					'us'
				),
				effects: [{ kind: 'update', rowId: 'olga', patch: { status: 'us' } }],
				change: 'Статус: ждёт клиента → ждёт нас'
			},
			{
				id: 'o3-step',
				prompt: 'Следующий шаг и срок?',
				rule: RULE_STEP,
				consider: [
					'Шаг — действие и день. Если ход наш — то, чего ждёт клиент.',
					'Регламент 2. Срок обещан — шаг на этот день. Если день уже прошёл — сегодня.',
					'Регламент 4. Полки по размерам клиента считаем по присланным размерам. Если размеров нет — замер.'
				],
				options: [
					{ id: 'calc-today', label: 'Посчитать полку и назвать срок и цену — сегодня', correct: true, feedback: 'Мы обещали ответ на следующий рабочий день после размеров — в прошлую пятницу. Срок прошёл, поэтому сегодня (регламент 2). Размеры есть — замер не нужен (регламент 4).', rule: RULE_STEP },
					{ id: 'remind', label: 'Напомнить про размеры — как стоит в строке', correct: false, feedback: 'Напоминание нужно, когда ход у клиента. Размеры уже пришли.', rule: RULE_STEP },
					{ id: 'thank', label: 'Поблагодарить за размеры — сегодня', correct: false, feedback: 'Благодарность не даёт Ольге того, чего она ждёт, — расчёта. После неё ход всё ещё наш.', rule: RULE_STEP }
				],
				effects: [{ kind: 'update', rowId: 'olga', patch: { task: 'Полка в нишу 84×210', step: 'Посчитать и назвать срок и цену', when: 'сегодня', reviewed: true } }],
				change: 'Шаг: посчитать и назвать срок и цену — сегодня'
			}
		]
	},
	{
		id: 'o4',
		title: 'Дмитрий · стеллаж 80 см',
		channel: 'form',
		who: 'Дмитрий',
		messages: [
			{ side: 'us', author: 'Вы (почта)', when: 'прошлый понедельник', text: 'Дмитрий, добрый день! Отправляю расчёт стеллажа 80 см.' },
			{ side: 'client', author: 'Дмитрий (форма на сайте)', when: 'прошлая среда', text: 'Спасибо за расчёт, но мы уже заказали в другом месте.' }
		],
		note: 'Сообщение пришло по другому каналу, но по той же задаче — к строке Дмитрия добавлен канал «форма на сайте» (правило 1).',
		enter: [{ kind: 'update', rowId: 'dmitry', patch: { channels: 'почта, форма на сайте' } }],
		focus: ['dmitry'],
		questions: [
			{
				id: 'o4-status',
				prompt: 'Чей сейчас ход?',
				rule: RULE_STATUS,
				consider: STATUS_CONSIDER,
				options: statusOptions(
					{
						us: 'По заказу больше нечего делать: Дмитрий ничего не просит и заказал в другом месте. Вежливо ответить можно, но это не продолжает задачу по заказу.',
						client: 'Ждать от Дмитрия нечего: он прямо сказал, что заказал в другом месте.',
						closed: 'Клиент прямо отказался — один из двух случаев, когда строку закрывают.'
					},
					'closed'
				),
				effects: [{ kind: 'update', rowId: 'dmitry', patch: { status: 'closed' } }],
				change: 'Статус: ждёт клиента → закрыто'
			},
			{
				id: 'o4-row',
				prompt: 'Что сделать со строкой?',
				rule: RULE_CLOSED,
				consider: ['Правило 4. Закрытые строки не удаляем: по ним видно, сколько обращений не дошло до заказа и почему.'],
				options: [
					{ id: 'keep', label: 'Оставить с пометкой «заказал в другом месте»', correct: true, feedback: 'Закрытые строки не удаляют: по ним видно, сколько обращений не дошло до заказа и почему.', rule: RULE_CLOSED },
					{ id: 'delete', label: 'Удалить строку', correct: false, feedback: 'Удалённый отказ не попадёт в итог недели, и причину никто не увидит.', rule: RULE_CLOSED },
					{ id: 'remind', label: 'Напомнить о расчёте, как стояло в строке', correct: false, feedback: 'Задача закрыта: напоминать о расчёте после отказа незачем.', rule: RULE_STATUS }
				],
				effects: [{ kind: 'update', rowId: 'dmitry', patch: { step: 'Заказал в другом месте', when: '—', reviewed: true } }],
				change: 'Строка закрыта с пометкой «заказал в другом месте»'
			}
		]
	},
	{
		id: 'o5',
		title: 'Марина · полка и крючки',
		channel: 'chat',
		who: 'Марина',
		messages: [
			{ side: 'client', author: 'Марина', when: 'прошлая суббота, 11:20', text: 'Здравствуйте! Хочу полку над рабочим столом во всю стену — размеров пока не знаю. И ещё шесть крючков в прихожую, как у вас на фото в профиле.' }
		],
		note: 'Ответа не было. Новая клиентка.',
		enter: [
			{ kind: 'add', row: { id: 'marina', who: 'Марина', task: 'Полка и крючки', channels: 'мессенджер', status: 'new', step: NOT_YET, when: '—', reviewed: false } }
		],
		focus: ['marina', 'marina-shelf', 'marina-hooks'],
		questions: [
			{
				id: 'o5-rows',
				prompt: 'Сколько строк завести?',
				rule: RULE_TASK,
				consider: [
					'Правило 1. Задача — то, что можно выполнить или закрыть отдельно от других.',
					'Две просьбы — две строки, только если каждую можно выполнить без другой. Шаги одной задачи — в той же строке.'
				],
				options: [
					{ id: 'one', label: 'Одну: одна клиентка, одно сообщение', correct: false, feedback: 'Строка — это задача, а не сообщение. Крючки можно продать и отдать сразу, полке нужен замер. В одной строке крючки будут ждать замера.', rule: RULE_TASK },
					{ id: 'two', label: 'Две: полка и крючки', correct: true, feedback: 'Крючки можно продать и отдать, не дожидаясь полки, а полку сделать без крючков: у каждой части свой результат. Поэтому строк две — а уже следом у них разные шаги и сроки. Обе — «ждёт нас»: Марина спросила, мы не ответили.', rule: RULE_TASK },
					{ id: 'three', label: 'Три: полка, замер и крючки', correct: false, feedback: 'Замер — шаг задачи «полка», а не отдельная задача: без полки он не нужен.', rule: RULE_TASK }
				],
				effects: [
					{ kind: 'remove', rowId: 'marina' },
					{ kind: 'add', row: { id: 'marina-shelf', who: 'Марина', task: 'Полка над столом во всю стену', channels: 'мессенджер', status: 'us', step: NOT_YET, when: '—', reviewed: false } },
					{ kind: 'add', row: { id: 'marina-hooks', who: 'Марина', task: 'Крючки в прихожую, 6 шт.', channels: 'мессенджер', status: 'us', step: NOT_YET, when: '—', reviewed: false } }
				],
				change: 'Строки: одна → две, обе «ждёт нас»'
			},
			{
				id: 'o5-shelf',
				prompt: 'Полка: следующий шаг и срок?',
				rule: RULE_STEP,
				consider: [
					'Регламент 4. Полки по размерам клиента считаем по присланным размерам. Если размеров нет — предлагаем замер. Замеры — по средам.',
					'Регламент 1. Ход наш и срок не обещан — делаем сегодня.'
				],
				options: [
					{ id: 'offer-measure', label: 'Предложить замер в эту среду — написать сегодня', correct: true, feedback: 'Размеров нет — нужен замер, а замеры по средам (регламент 4). Ход наш, поэтому написать Марине — сегодня (регламент 1).', rule: RULE_STEP },
					{ id: 'price', label: 'Назвать цену полки — сегодня', correct: false, feedback: 'Без размеров цену не посчитать: сначала замер (регламент 4).', rule: RULE_STEP },
					{ id: 'measure-today', label: 'Приехать на замер — сегодня', correct: false, feedback: 'Замеры — по средам (регламент 4). Сегодня понедельник.', rule: RULE_STEP }
				],
				effects: [{ kind: 'update', rowId: 'marina-shelf', patch: { step: 'Предложить замер в эту среду', when: 'сегодня', reviewed: true } }],
				change: 'Полка: предложить замер в эту среду — написать сегодня'
			},
			{
				id: 'o5-hooks',
				prompt: 'Крючки: следующий шаг и срок?',
				rule: RULE_STEP,
				consider: [
					'Регламент 4. Крючки — по прайсу, цену называем сразу.',
					'Регламент 1. Ход наш и срок не обещан — делаем сегодня.'
				],
				options: [
					{ id: 'price-today', label: 'Назвать цену крючков — сегодня', correct: true, feedback: 'Крючки есть в прайсе (регламент 4). Ход наш, срок не обещан — сегодня (регламент 1).', rule: RULE_STEP },
					{ id: 'after-measure', label: 'Назвать цену после замера, вместе с полкой', correct: false, feedback: 'Крючки не зависят от замера — поэтому строк и две. Марина будет ждать без причины.', rule: RULE_STEP },
					{ id: 'wait', label: 'Подождать, пока Марина решит с полкой', correct: false, feedback: 'Про крючки Марина уже всё сказала: ждёт цену. Ход наш.', rule: RULE_STATUS }
				],
				effects: [{ kind: 'update', rowId: 'marina-hooks', patch: { step: 'Назвать цену', when: 'сегодня', reviewed: true } }],
				change: 'Крючки: назвать цену — сегодня'
			}
		]
	},
	{
		id: 'o6',
		title: 'Анна · звонок',
		channel: 'call',
		who: 'Анна',
		messages: [
			{ side: 'client', author: 'Пропущенный вызов', when: 'сегодня, 8:50', text: 'Анна (мессенджер)' },
			{ side: 'client', author: 'Автоответчик', when: 'сегодня, 8:51', text: '«Здравствуйте, это Анна. Я писала вам в пятницу про полку на девяносто. Перезвоните, пожалуйста.»' }
		],
		/** Новый звонок по задаче Анны: строка снова ждёт разбора. */
		enter: [{ kind: 'update', rowId: 'anna', patch: { reviewed: false } }],
		focus: ['anna'],
		questions: [
			{
				id: 'o6-where',
				prompt: 'Куда записать звонок?',
				rule: RULE_TASK,
				consider: [
					'Правило 1. Новые сообщения и звонки по той же задаче — в ту же строку, в любом канале.'
				],
				options: [
					{ id: 'new-row', label: 'Новая строка: другой канал', correct: false, feedback: 'Анна продолжает ту же задачу — полку 90 см. Новый канал не создаёт строку: иначе по одной задаче будет два шага, и один из них останется невыполненным.', rule: RULE_TASK },
					{ id: 'anna-row', label: 'В строку Анны про полку 90 см', correct: true, feedback: 'Та же клиентка и та же задача. В строку добавляется канал «телефон», шаг обновляется.', rule: RULE_TASK },
					{ id: 'nowhere', label: 'Никуда: это просто звонок', correct: false, feedback: 'Анна просит перезвонить — это наш ход. Без записи он потеряется.', rule: RULE_STATUS }
				],
				effects: [{ kind: 'update', rowId: 'anna', patch: { channels: 'мессенджер, телефон' } }],
				change: 'Каналы: мессенджер → мессенджер, телефон'
			},
			{
				id: 'o6-step',
				prompt: 'Шаг по строке Анны?',
				rule: RULE_STEP,
				consider: [
					'Шаг — действие и день. Если ход наш — то, чего ждёт клиент.',
					'Регламент 1. Ход наш и срок не обещан — делаем сегодня.'
				],
				options: [
					{ id: 'call-today', label: 'Перезвонить, подтвердить, что берёмся, и назвать цену — сегодня', correct: true, feedback: 'Анна прямо попросила перезвонить — поэтому шаг здесь звонок. Срок прежний: сегодня (регламент 1).', rule: RULE_STEP },
					{ id: 'message', label: 'Ответить в мессенджере, как стоит в строке', correct: false, feedback: 'Анна прямо попросила перезвонить. Дело не в том, что звонок лучше сообщения: сообщение просто не выполняет её просьбу.', rule: RULE_STEP },
					{ id: 'call-wed', label: 'Перезвонить в эту среду', correct: false, feedback: 'Среду не обещали; ход наш, срок по регламенту 1 — сегодня.', rule: RULE_STEP }
				],
				effects: [{ kind: 'update', rowId: 'anna', patch: { step: 'Перезвонить, подтвердить, что берёмся, и назвать цену', when: 'сегодня', reviewed: true } }],
				change: 'Шаг: перезвонить, подтвердить, что берёмся, и назвать цену — сегодня'
			}
		]
	}
];
