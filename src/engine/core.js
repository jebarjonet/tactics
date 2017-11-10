// @flow

import { sample } from 'lodash/fp'

import PathFinder from './pathfinder'
import type { FindPathType, FindZoneType } from './pathfinder'
import type { Grid as GridType, Point as PointType } from './types'

class Core {
  grid: ?GridType
  pathFinder: Object

  constructor(gridSize: number) {
    this.pathFinder = new PathFinder()
    this.pathFinder.setAcceptableTiles([0])

    // create grid
    this.setGrid(this.generateGrid(gridSize))
  }

  generateGrid = (size: number): GridType => {
    const grid = []

    // fill grid with cells
    for (let i = 0; i < size; i++) {
      grid[i] = []
      for (let j = 0; j < size; j++) {
        // set a random value in cell: 3 chances out of 4 to be walkable
        grid[i][j] = sample([0, 0, 0, 1])
      }
    }

    return grid
  }

  setGrid = (grid: GridType) => {
    this.grid = grid
    this.pathFinder.setGrid(grid)
  }

  findPath = (startPoint: PointType, endPoint: PointType): FindPathType => {
    // temporarily set start and end nodes as walkable
    this.pathFinder.setGridPointValue(startPoint, 0)
    this.pathFinder.setGridPointValue(endPoint, 0)

    // find path
    return this.pathFinder.findPath(startPoint, endPoint)
  }

  findZone = (
    startPoint: PointType,
    distance: number,
    options: Object = {},
  ): FindZoneType => {
    // temporarily set start node as walkable
    this.pathFinder.setGridPointValue(startPoint, 0)

    // find zone
    return this.pathFinder.findZone(startPoint, distance, options)
  }
}

export default Core
