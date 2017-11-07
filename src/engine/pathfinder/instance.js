// @flow

import type Heap from 'heap'
import type { Point as PointType, Node as NodeType } from '../types'

/**
 * Represents a single instance of pathfinder
 * A path that is in the queue to eventually be found.
 */
class Instance {
  endPoint: ?PointType
  nodeHash: { [y: number]: { [x: number]: NodeType } }
  openList: Heap // Heap object
  startPoint: ?PointType

  constructor() {
    this.endPoint = null
    this.nodeHash = {}
    this.openList = null
    this.startPoint = null
  }
}

module.exports = Instance
