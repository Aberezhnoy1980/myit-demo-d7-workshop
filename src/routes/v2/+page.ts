import { redirect } from '@sveltejs/kit';
import { page } from '#lib/page';

/** Совместимый адрес: постоянный переход на основной маршрут. */
export function load(): never {
	redirect(308, page('/'));
}
