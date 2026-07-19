import { deepStrictEqual } from 'node:assert'
import test from 'node:test'
import { getMapOfArrays } from '../src/lib.js'

function getInput(value) {
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
win32:win,windows`, getInput)
  deepStrictEqual(actual, expected)
})

test('getMapOfArrays with spaces', () => {
  const actual = getMapOfArrays(` darwin : macos
 linux :
 win32 : win , windows `, getInput)
  deepStrictEqual(actual, expected)
})
