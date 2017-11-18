// @flow

import type { Node as NodeType } from 'game/types'

/**
 * A simple Node that represents a single tile on the grid.
 * @param {Object} parent The parent node.
 * @param {Number} x The x position on the grid.
 * @param {Number} y The y position on the grid.
 * @param {Number} cost How far this node is in moves*cost from the start.
 * @param {Number} simpleDistanceToTarget Manhatten distance to the end point.
 **/
class Node {
  cost: number
  parent: ?NodeType
  simpleDistanceToTarget: number
  x: number
  y: number

  constructor(
    parent: ?NodeType,
    x: number,
    y: number,
    cost: number,
    simpleDistanceToTarget: number,
  ) {
    this.cost = cost
    this.parent = parent
    this.simpleDistanceToTarget = simpleDistanceToTarget
    this.x = x
    this.y = y
  }

  /**
   * @return {Number} Best guess distance of a cost using this node.
   **/
  bestGuessDistance = (): number => {
    return this.cost + this.simpleDistanceToTarget
  }
}

export default Node
