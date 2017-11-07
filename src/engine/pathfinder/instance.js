/**
 * Represents a single instance of pathfinder
 * A path that is in the queue to eventually be found.
 */
class Instance {
  constructor() {
    this.pointsToAvoid = {}
    this.startX = null
    this.startY = null
    this.endX = null
    this.endY = null
    this.nodeHash = {}
    this.openList = null
  }
}

module.exports = Instance
