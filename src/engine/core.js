// @flow

import _ from 'lodash/fp'

import PathFinder from './pathfinder'
import type {
  Grid as GridType,
  Point as PointType,
  Node as NodeType,
} from './types'

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
        grid[i][j] = _.sample([0, 0, 0, 1])
      }
    }

    return grid
  }

  setGrid = (grid: GridType) => {
    this.grid = grid
    this.pathFinder.setGrid(grid)
  }

  findPath = (
    startPoint: PointType,
    endPoint: PointType,
  ): {
    instance: Object,
    path: Array<NodeType>,
  } => {
    // temporarily set start and end nodes as walkable
    this.pathFinder.setGridPointValue(startPoint.x, startPoint.y, 0)
    this.pathFinder.setGridPointValue(endPoint.x, endPoint.y, 0)

    // find path
    return this.pathFinder.findPath(startPoint, endPoint)
  }

  findZone = (
    startPoint: PointType,
    distance: number,
    options: {
      extension?: number,
    } = {},
  ): {
    instance: Object,
  } => {
    // temporarily set start node as walkable
    this.pathFinder.setGridPointValue(startPoint.x, startPoint.y, 0)

    // find zone
    return this.pathFinder.findZone(startPoint, distance)
  }
}

export default Core
