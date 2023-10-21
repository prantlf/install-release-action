const json = require('@rollup/plugin-json')
const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const { main } = require('./package.json')
const builtins = require('builtins')

module.exports = {
  input: 'src/index.js',
  output: { file: main, format: 'cjs', sourcemap: true },
  plugins: [json(), commonjs(), nodeResolve({ preferBuiltins: true })],
  external: builtins()
}
