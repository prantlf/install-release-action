const core = require('@actions/core')
const { getMapOfArrays } = require('../src/lib')
const test = require('node:test')
const { deepStrictEqual } = require('node:assert')

core.getInput = function (value) {
  return value
}

const expected = {
  darwin: ['macos'],
  linux: [],
  win32: ['win', 'windows']
}

test('getMapOfArrays without spaces', () => {
  const actual = getMapOfArrays(`darwin:macos
linux:
win32:win,windows`)
  deepStrictEqual(actual, expected)
})

test('getMapOfArrays with spaces', () => {
  const actual = getMapOfArrays(` darwin : macos 
 linux : 
 win32 : win , windows `)
 deepStrictEqual(actual, expected)
})
