import { resolve } from '$app/paths';

type PagePath = '/' | '/razbor' | '/praktikum';

/** Ссылка на пререндеренный каталог: у статического хоста нужен завершающий слэш. */
export function page(path: PagePath): string {
	const value = resolve(path);
	return value.endsWith('/') ? value : `${value}/`;
}
