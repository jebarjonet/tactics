// @flow

import PathFinder from './PathFinder'
import type { FindPathType, FindZoneType } from './PathFinder'
import { hashToArray } from 'engine/utils'
import type { Grid as GridType, Point as PointType } from 'engine/types'

class TerrainAnalyser {
  grid: GridType
  pathFinder: Object

  constructor(grid: GridType) {
    this.pathFinder = new PathFinder()
    this.pathFinder.setAcceptableTiles([0])
    this.setGrid(grid)
  }

  setGrid = (grid: GridType) => {
    this.grid = grid
    this.pathFinder.setGrid(grid)
  }

  /**
   * Find a walkable path from start point to end point
   * @param startPoint
   * @param endPoint
   * @returns {FindPathType}
   */
  findPath = (startPoint: PointType, endPoint: PointType): FindPathType => {
    // temporarily set start and end nodes as walkable
    this.pathFinder.setGridPointValue(startPoint, 0)
    this.pathFinder.setGridPointValue(endPoint, 0)

    // find path
    return this.pathFinder.findPath(startPoint, endPoint)
  }

  /**
   * Find walkable zone around a start point to a distance (walkable constraints)
   * @param startPoint
   * @param distance
   * @param options
   * @param options.extension zone around found zone to a distance (no walkable constraints)
   * @returns {FindZoneType}
   */
  findZone = (
    startPoint: PointType,
    distance: number,
    options: { extension?: number } = {},
  ): FindZoneType => {
    // temporarily set start node as walkable
    this.pathFinder.setGridPointValue(startPoint, 0)

    // find zone
    return this.pathFinder.findZone(startPoint, distance, options)
  }

  /**
   * Find zone around a start point to a distance (no walkable constraints)
   * @param startPoint
   * @param distance
   * @returns {Array.<T>}
   */
  coverZone = (startPoint: PointType, distance: number) => {
    const zone = {}

    for (let diffY = -distance; diffY <= distance; diffY++) {
      let y = startPoint.y + diffY

      if (!zone[y]) {
        zone[y] = {}
      }

      for (let diffX = -distance; diffX <= distance; diffX++) {
        let x = startPoint.x + diffX
        const distanceSoFar = Math.abs(diffY) + Math.abs(diffX)

        // give up if distance to start point is more than desired distance
        if (distanceSoFar > distance) {
          continue
        }

        const point = { x, y, distance: distanceSoFar }

        // give up if start point is out of grid
        if (this.pathFinder.pointIsOutOfGrid(point)) {
          continue
        }

        zone[y][x] = point
      }
    }

    return hashToArray(zone)
  }
}

export default TerrainAnalyser
