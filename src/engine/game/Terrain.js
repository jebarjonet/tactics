// @flow

import { sample, flow, flattenDeep, filter } from 'lodash/fp'

import type { Grid as GridType, Point as PointType } from 'engine/types'
import Map from 'engine/game/Map'
import type MapType from 'engine/game/Map'

class Terrain {
  costMap: MapType // walk cost (0 to INFINITY)
  height: number
  heightMap: MapType // height of terrain (from 0 to 20)
  typeMap: MapType // type of terrain (0 = grass, 1 = rock, etc.)
  walkableMap: MapType // terrain walkable attributes (0 = can walk, 1 = can not walk)
  width: number

  constructor(gridSize: number) {
    this.height = gridSize
    this.width = gridSize

    const costGrid = this.generateCostGrid(gridSize, gridSize)
    this.costMap = new Map(costGrid)
    const walkableGrid = this.generateWalkableGrid(gridSize, gridSize)
    this.walkableMap = new Map(walkableGrid)
  }

  getHeight = (): number => this.height
  getWidth = (): number => this.width

  generateCostGrid = (width: number, height: number): GridType => {
    const grid = []

    for (let y = 0; y < height; y++) {
      grid[y] = []
      for (let x = 0; x < width; x++) {
        grid[y][x] = 0
      }
    }

    return grid
  }

  generateWalkableGrid = (width: number, height: number): GridType => {
    const grid = []

    for (let y = 0; y < height; y++) {
      grid[y] = []
      for (let x = 0; x < width; x++) {
        // set a random value in cell
        grid[y][x] = sample([0, 0, 0, 0, 0, 0, 0, 1])
      }
    }

    return grid
  }

  getCostMap = (): MapType => this.costMap

  getWalklableMap = (): MapType => this.walkableMap
  getUnwalkableZone = (): Array<PointType> =>
    flow([
      grid =>
        grid.map((row, y) =>
          row.map((cell, x) => ({
            value: cell,
            x,
            y,
          })),
        ),
      flattenDeep,
      filter(node => node.value === 1),
    ])(this.getWalklableMap().getGrid())
}

export default Terrain
