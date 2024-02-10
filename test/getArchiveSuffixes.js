const { getArchiveSuffixes } = require('../src/lib')
const test = require('node:test')
const { deepStrictEqual } = require('node:assert')

const { arch, platform } = process

const platforms = {
  darwin: ['macos'],
  linux: [],
  win32: ['win', 'windows']
}

const archives = {
  arm64: ['aarch64'],
  x64: ['amd64', 'x86_64', 'x86']
}

const expected = {
  'darwin-x64': [
    '-macos-amd64.zip',
    '-macos-x86_64.zip',
    '-macos-x86.zip',
    '-macos-x64.zip',
    '-darwin-amd64.zip',
    '-darwin-x86_64.zip',
    '-darwin-x86.zip',
    '-darwin-x64.zip'
  ],
  'darwin-arm64': [
    '-macos-amd64.zip',
    '-macos-aarch64.zip',
    '-darwin-amd64.zip',
    '-darwin-arm64.zip',
  ],
  'linux-x64': [
    '-linux-amd64.zip',
    '-linux-x86_64.zip',
    '-linux-x86.zip',
    '-linux-x64.zip'
  ],
  'linux-arm64': [
    '-linux-arm64.zip',
    '-linux-aarch64.zip'
  ],
  'win32-x64': [
    '-win-amd64.zip',
    '-win-x86_64.zip',
    '-win-x86.zip',
    '-win-x64.zip',
    '-windows-amd64.zip',
    '-windows-x86_64.zip',
    '-windows-x86.zip',
    '-windows-x64.zip',
    '-win32-amd64.zip',
    '-win32-x86_64.zip',
    '-win32-x86.zip',
    '-win32-x64.zip'
  ],
  'win32-arm64': [
    '-win-amd64.zip',
    '-win-aarch64.zip',
    '-windows-amd64.zip',
    '-windows-aarch64.zip',
    '-win32-amd64.zip',
    '-win32-aarch64.zip'
  ],
}

test('getArchiveSuffixes', () => {
  const actual = getArchiveSuffixes(platforms, archives)
  deepStrictEqual(actual, expected[`${platform}-${arch}`])
})
