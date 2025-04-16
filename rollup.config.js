import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import { readFileSync } from 'fs';

// Read package.json manually since direct import with assertions isn't widely supported yet
const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
);

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 *
 * Copyright (c) ${new Date().getFullYear()} ${pkg.author}
 * Licensed under the ${pkg.license} license
 */`;

export default [
  // UMD build (for browsers)
  {
    input: 'src/index.js',
    external: ['video.js'],
    output: {
      name: 'videojsAniskip',
      file: pkg.browser,
      format: 'umd',
      banner,
      globals: {
        'video.js': 'videojs'
      }
    },
    plugins: [
      resolve(),
      commonjs(),
      postcss({
        extract: 'dist/videojs-aniskip.css',
        minimize: true
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      }),
      terser()
    ]
  },
  // CommonJS build (for Node)
  {
    input: 'src/index.js',
    external: ['video.js'],
    output: {
      file: pkg.main,
      format: 'cjs',
      banner
    },
    plugins: [
      resolve(),
      commonjs(),
      postcss({
        extract: false,
        inject: false
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      })
    ]
  },
  // ES module build (for bundlers)
  {
    input: 'src/index.js',
    external: ['video.js'],
    output: {
      file: pkg.module,
      format: 'es',
      banner
    },
    plugins: [
      resolve(),
      commonjs(),
      postcss({
        extract: false,
        inject: false
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      })
    ]
  }
];