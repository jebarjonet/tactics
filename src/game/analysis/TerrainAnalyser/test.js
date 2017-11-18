import { sortBy } from 'lodash/fp'

import Terrain from 'game/engine/Terrain'
import TerrainAnalyser from './'

let terrainAnalyser = null

/**
 * Transforms a grid to array (keep x and y)
 * Orders by value of cell if any
 * @param grid
 */
const gridToArray = grid => {
  const array = []

  grid.forEach((row, y) => {
    row.forEach((value, x) => {
      if (grid[y][x]) {
        array.push({ x, y, value })
      }
    })
  })

  return sortBy(['value', 'y', 'x'])(array)
}

/**
 * Transforms array of nodes/points to array of points
 * @param array
 */
const arrayToPoints = array => array.map(node => ({ x: node.x, y: node.y }))

describe('engine:terrainAnalyser', () => {
  beforeEach(() => {
    const terrain = new Terrain(5)
    terrainAnalyser = new TerrainAnalyser(terrain)
  })

  test('findPath', () => {
    terrainAnalyser.setGrid([
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
    ])
    const { path } = terrainAnalyser.findPath({ x: 0, y: 0 }, { x: 4, y: 0 })
    expect(arrayToPoints(path)).toEqual(
      arrayToPoints(
        gridToArray([
          [1, 2, 0, 12, 13],
          [0, 3, 0, 11, 0],
          [0, 4, 0, 10, 0],
          [0, 5, 0, 9, 0],
          [0, 6, 7, 8, 0],
        ]),
      ),
    )
  })

  test('findZone', () => {
    terrainAnalyser.setGrid([
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ])
    const { zone, extendedZone } = terrainAnalyser.findZone({ x: 3, y: 3 }, 2, {
      extension: 1,
    })
    expect(arrayToPoints(zone)).toEqual(
      arrayToPoints(
        gridToArray([
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 1, 0, 1, 0, 0],
          [0, 1, 1, 1, 1, 1, 0],
          [0, 0, 1, 1, 1, 0, 0],
          [0, 0, 0, 1, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
        ]),
      ),
    )
    expect(arrayToPoints(extendedZone)).toEqual(
      arrayToPoints(
        gridToArray([
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 1, 0, 1, 0, 0],
          [0, 1, 1, 1, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1],
          [0, 1, 1, 1, 1, 1, 0],
          [0, 0, 1, 1, 1, 0, 0],
          [0, 0, 0, 1, 0, 0, 0],
        ]),
      ),
    )
  })

  test('coverZone', () => {
    terrainAnalyser.setGrid([
      [0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ])
    const zone = terrainAnalyser.coverZone({ x: 2, y: 2 }, 2)
    expect(arrayToPoints(zone)).toEqual(
      arrayToPoints(
        gridToArray([
          [0, 0, 1, 0, 0],
          [0, 1, 1, 1, 0],
          [1, 1, 1, 1, 1],
          [0, 1, 1, 1, 0],
          [0, 0, 1, 0, 0],
        ]),
      ),
    )
  })
})
