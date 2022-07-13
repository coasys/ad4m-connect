import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
//import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import postcss from "rollup-plugin-postcss";
import typescript from "@rollup/plugin-typescript"

const production = !process.env.ROLLUP_WATCH;

export default
{
	input: 'src/Ad4mConnectDialog.svelte',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'Ad4mConnectDialog',
		file: 'public/Ad4mConnectDialog.js'
	},
	plugins: [
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			preprocess: sveltePreprocess(),
			customElement: true,
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		postcss({
			extract: true,
			minimize: true,
			use: [
				['sass', {
				includePaths: [
					'./theme',
					'./node_modules'
				]
				}]
			]
			}),
		//typescript({ sourceMap: !production }),
		
		// If we're building for production (npm run build
		// instead of npm run dev), minify
		//production && terser()
	],
	watch: {
		clearScreen: false
	}
}	