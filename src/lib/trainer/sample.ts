import { solveAll } from './engine';
import type { Row } from './model';

/**
 * Итоговая таблица полного разбора. Считается тем же движком, что и прохождение, —
 * отдельного списка строк нет. На хабе используется как образец результата.
 */
export const FINAL_ROWS: readonly Row[] = solveAll().rows;
