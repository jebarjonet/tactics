// @flow

import type { Node as NodeType } from '../types'

/**
 * A simple Node that represents a single tile on the grid.
 * @param {Object} parent The parent node.
 * @param {Number} x The x position on the grid.
 * @param {Number} y The y position on the grid.
 * @param {Number} costSoFar How far this node is in moves*cost from the start.
 * @param {Number} simpleDistanceToTarget Manhatten distance to the end point.
 **/
class Node {
  costSoFar: number
  parent: ?NodeType
  simpleDistanceToTarget: number
  x: number
  y: number

  constructor(
    parent: ?NodeType,
    x: number,
    y: number,
    costSoFar: number,
    simpleDistanceToTarget: number,
  ) {
    this.parent = parent
    this.x = x
    this.y = y
    this.costSoFar = costSoFar
    this.simpleDistanceToTarget = simpleDistanceToTarget
  }

  /**
   * @return {Number} Best guess distance of a cost using this node.
   **/
  bestGuessDistance = (): number => {
    return this.costSoFar + this.simpleDistanceToTarget
  }
}

module.exports = Node
