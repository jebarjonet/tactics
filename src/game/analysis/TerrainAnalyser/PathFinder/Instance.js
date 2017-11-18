// @flow

import type Heap from 'heap'
import type { Point as PointType, Node as NodeType } from 'game/types'

/**
 * Represents a single instance of pathfinder
 * A path that is in the queue to eventually be found.
 */
class Instance {
  endPoint: ?PointType = null
  nodeHash: { [y: number]: { [x: number]: NodeType } } = {}
  openList: Heap = null // Heap object
  startPoint: ?PointType = null
}

export default Instance
