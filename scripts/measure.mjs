import { existsSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';

const root = resolve('build');
const pages = ['index.html', 'razbor/index.html', 'praktikum/index.html'];

function urlsFrom(file, text) {
	const found = new Set();
	for (const match of text.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
		const url = match[1];
		if (url.startsWith('#') || url.startsWith('data:') || url.startsWith('http')) continue;
		found.add(new URL(url, `http://local/${file}`).pathname);
	}
	return found;
}

function fileFor(pathname) {
	const file = resolve(root, `.${pathname}`);
	return existsSync(file) && statSync(file).isFile() ? file : null;
}

for (const page of pages) {
	const html = readFileSync(resolve(root, page), 'utf8');
	const assets = urlsFrom(page, html);
	const css = [...assets].filter((item) => item.endsWith('.css'));
	for (const sheet of css) {
		const text = readFileSync(resolve(root, `.${sheet}`), 'utf8');
		for (const match of text.matchAll(/url\(([^)]+)\)/g)) {
			const raw = match[1].replaceAll(/['"]/g, '');
			if (raw.startsWith('data:')) continue;
			assets.add(new URL(raw, `http://local${sheet}`).pathname);
		}
	}
	let total = statSync(resolve(root, page)).size;
	let jsRaw = 0;
	let jsGzip = 0;
	const lines = [];
	for (const asset of [...assets].sort()) {
		const file = fileFor(asset);
		if (!file) continue;
		const size = statSync(file).size;
		total += size;
		if (asset.endsWith('.js')) {
			jsRaw += size;
			jsGzip += gzipSync(readFileSync(file)).length;
		}
		lines.push(`${String(size).padStart(7)}  ${asset}`);
	}
	console.log(`\n${page}`);
	console.log(lines.join('\n'));
	console.log(`html+linked ${total} bytes`);
	console.log(`js raw ${jsRaw} bytes, gzip ${jsGzip} bytes`);
}
