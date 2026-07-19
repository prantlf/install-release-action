import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import builtins from 'builtins'
import pkg from './package.json' with { type: 'json' }

export default {
  input: 'src/index.js',
  output: { file: pkg.main, sourcemap: true },
  plugins: [json(), commonjs(), nodeResolve({ preferBuiltins: true })],
  external: builtins()
}
