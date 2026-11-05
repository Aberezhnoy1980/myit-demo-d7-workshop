import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** Считает классы, включая аргумент :not(). Сам :not() вес не добавляет. */
function specificity(selector: string): number {
	const expanded = selector.replace(/:not\(([^)]+)\)/g, ' $1 ');
	const classes = expanded.match(/\.[A-Za-z0-9_-]+/g)?.length ?? 0;
	return classes;
}

describe('mobile ledger cascade', () => {
	it('overrides the 40rem table minimum inside the narrow media query', () => {
		const css = readFileSync(new URL('../app.css', import.meta.url), 'utf8');
		const wide = '.ledger-wrap:not(.brief) .ledger';
		const mobileStart = css.indexOf('@media (max-width: 760px)');
		const mobileEnd = css.indexOf('@media (min-width: 1100px)');
		const mobile = css.slice(mobileStart, mobileEnd);
		expect(mobileStart).toBeGreaterThan(css.indexOf(`${wide} {`));
		expect(specificity(wide)).toBeGreaterThan(specificity('.ledger'));
		expect(mobile).toContain(wide);
		expect(mobile).toMatch(/\.ledger-wrap:not\(\.brief\) \.ledger[\s\S]*?min-width:\s*0/);
	});
});
