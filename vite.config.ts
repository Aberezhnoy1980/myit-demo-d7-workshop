import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const base = process.env.BASE_PATH ?? '';
if (base !== '' && !(base.startsWith('/') && !base.endsWith('/'))) {
	throw new Error('BASE_PATH must be empty or a prefix like /demo/d7');
}

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter({ strict: true }),
			paths: {
				base: base as '' | `/${string}`,
				relative: true
			}
		})
	]
});
