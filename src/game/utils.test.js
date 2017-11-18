import * as utils from './utils'

describe('engine:utils', () => {
  test('convertRange', () => {
    expect(utils.convertRange(1, [0, 2], [0, 10])).toBe(5)
    expect(utils.convertRange(5, [0, 10], [0, 100])).toBe(50)
    expect(utils.convertRange(4, [0, 5], [1, 0]).toFixed(2)).toBe('0.20')
    expect(utils.convertRange(1, [0, 5], [1, 0]).toFixed(2)).toBe('0.80')
  })
})
