/**
 *   Based on EasyStar.js
 *   github.com/prettymuchbryce/EasyStarJS
 **/

const Heap = require('heap')
const _ = require('lodash/fp')

const Instance = require('./instance')
const Node = require('./node')

const CLOSED_LIST = 0
const OPEN_LIST = 1
const STRAIGHT_COST = 1

class PathFinder {
  static TOP = 'TOP'
  static RIGHT = 'RIGHT'
  static BOTTOM = 'BOTTOM'
  static LEFT = 'LEFT'

  constructor() {
    this.pointsToAvoid = {}
    this.collisionGrid = null
    this.costMap = {}
    this.pointsToCost = {}
    this.directionalConditions = {}
    this.iterationsPerCalculation = Number.MAX_VALUE
    this.acceptableTiles = null
  }

  /**
   * Sets the collision grid that EasyStar uses.
   *
   * @param {Array|Number} tiles An array of numbers that represent
   * which tiles in your grid should be considered
   * acceptable, or "walkable".
   **/
  setAcceptableTiles = tiles => {
    if (tiles instanceof Array) {
      // Array
      this.acceptableTiles = tiles
    } else if (!isNaN(parseFloat(tiles)) && isFinite(tiles)) {
      // Number
      this.acceptableTiles = [tiles]
    }
  }

  /**
   * Sets the collision grid that EasyStar uses.
   *
   * @param {Array} grid The collision grid that this EasyStar instance will read from.
   * This should be a 2D Array of Numbers.
   **/
  setGrid = grid => {
    this.collisionGrid = grid

    //Setup cost map
    for (let y = 0; y < this.collisionGrid.length; y++) {
      for (let x = 0; x < this.collisionGrid[0].length; x++) {
        if (!this.costMap[this.collisionGrid[y][x]]) {
          this.costMap[this.collisionGrid[y][x]] = 1
        }
      }
    }
  }

  /**
   * Sets the tile cost for a particular tile type.
   *
   * @param {Number} tileType The tile type to set the cost for.
   * @param {Number} cost The multiplicative cost associated with the given tile.
   **/
  setTileCost = (tileType, cost) => {
    this.costMap[tileType] = cost
  }

  /**
   * Sets the an additional cost for a particular point.
   * Overrides the cost from setTileCost.
   *
   * @param {Number} x The x value of the point to cost.
   * @param {Number} y The y value of the point to cost.
   * @param {Number} cost The multiplicative cost associated with the given point.
   **/
  setAdditionalPointCost = (x, y, cost) => {
    if (!this.pointsToCost[y]) {
      this.pointsToCost[y] = {}
    }
    this.pointsToCost[y][x] = cost
  }

  /**
   * Remove the additional cost for a particular point.
   *
   * @param {Number} x The x value of the point to stop costing.
   * @param {Number} y The y value of the point to stop costing.
   **/
  removeAdditionalPointCost = (x, y) => {
    if (this.pointsToCost[y]) {
      delete this.pointsToCost[y][x]
    }
  }

  /**
   * Remove all additional point costs.
   **/
  removeAllAdditionalPointCosts = () => {
    this.pointsToCost = {}
  }

  /**
   * Sets a directional condition on a tile
   *
   * @param {Number} x The x value of the point.
   * @param {Number} y The y value of the point.
   * @param {Array.<String>} allowedDirections A list of all the allowed directions that can access
   * the tile.
   **/
  setDirectionalCondition = (x, y, allowedDirections) => {
    if (!this.directionalConditions[y]) {
      this.directionalConditions[y] = {}
    }
    this.directionalConditions[y][x] = allowedDirections
  }

  /**
   * Remove all directional conditions
   **/
  removeAllDirectionalConditions = () => {
    this.directionalConditions = {}
  }

  /**
   * Sets the number of search iterations per calculation.
   * A lower number provides a slower result, but more practical if you
   * have a large tile-map and don't want to block your thread while
   * finding a path.
   *
   * @param {Number} iterations The number of searches to prefrom per calculate() call.
   **/
  setIterationsPerCalculation = iterations => {
    this.iterationsPerCalculation = iterations
  }

  /**
   * Avoid a particular point on the grid,
   * regardless of whether or not it is an acceptable tile.
   *
   * @param {Number} x The x value of the point to avoid.
   * @param {Number} y The y value of the point to avoid.
   **/
  avoidAdditionalPoint = (x, y) => {
    if (!this.pointsToAvoid[y]) {
      this.pointsToAvoid[y] = {}
    }
    this.pointsToAvoid[y][x] = 1
  }

  /**
   * Stop avoiding a particular point on the grid.
   *
   * @param {Number} x The x value of the point to stop avoiding.
   * @param {Number} y The y value of the point to stop avoiding.
   **/
  stopAvoidingAdditionalPoint = (x, y) => {
    if (this.pointsToAvoid[y]) {
      delete this.pointsToAvoid[y][x]
    }
  }

  /**
   * Stop avoiding all additional points on the grid.
   **/
  stopAvoidingAllAdditionalPoints = () => {
    this.pointsToAvoid = {}
  }

  /**
   * Find a path.
   *
   * @param {Number} startX The X position of the starting point.
   * @param {Number} startY The Y position of the starting point.
   * @param {Number} endX The X position of the ending point.
   * @param {Number} endY The Y position of the ending point.
   * @return {Object}
   *
   **/
  findPath = (startX, startY, endX, endY) => {
    // No acceptable tiles were set
    if (!this.acceptableTiles) {
      throw new Error(
        "You can't set a path without first calling setAcceptableTiles() on EasyStar.",
      )
    }

    // No grid was set
    if (!this.collisionGrid) {
      throw new Error(
        "You can't set a path without first calling setGrid() on EasyStar.",
      )
    }

    // Start or endpoint outside of scope.
    if (
      startX < 0 ||
      startY < 0 ||
      endX < 0 ||
      endY < 0 ||
      startX > this.collisionGrid[0].length - 1 ||
      startY > this.collisionGrid.length - 1 ||
      endX > this.collisionGrid[0].length - 1 ||
      endY > this.collisionGrid.length - 1
    ) {
      throw new Error(
        'Your start or end point is outside the scope of your grid.',
      )
    }

    // Start and end are the same tile.
    if (startX === endX && startY === endY) {
      return { path: [] }
    }

    // End point is not an acceptable tile.
    const endTile = this.collisionGrid[endY][endX]
    let isAcceptable = false
    for (let i = 0; i < this.acceptableTiles.length; i++) {
      if (endTile === this.acceptableTiles[i]) {
        isAcceptable = true
        break
      }
    }

    if (isAcceptable === false) {
      return {}
    }

    // Create the instance
    const instance = new Instance()
    instance.openList = new Heap(
      (nodeA, nodeB) => nodeA.bestGuessDistance() - nodeB.bestGuessDistance(),
    )
    instance.nodeHash = {}
    instance.startX = startX
    instance.startY = startY
    instance.endX = endX
    instance.endY = endY

    instance.openList.push(
      this.coordinateToNode(
        instance,
        instance.startX,
        instance.startY,
        null,
        STRAIGHT_COST,
      ),
    )

    let path = null

    for (
      let iterationsSoFar = 0;
      iterationsSoFar < this.iterationsPerCalculation;
      iterationsSoFar++
    ) {
      // Couldn't find a path.
      if (instance.openList.size() === 0) {
        path = null
        break
      }

      const searchNode = instance.openList.pop()

      if (searchNode.costSoFar >= 6) {
        continue
      }

      // Handles the case where we have found the destination
      // if (instance.endX === searchNode.x && instance.endY === searchNode.y) {
      //   path = []
      //   path.push({ x: searchNode.x, y: searchNode.y })
      //   let parent = searchNode.parent
      //   while (parent) {
      //     path.push({ x: parent.x, y: parent.y })
      //     parent = parent.parent
      //   }
      //   path.reverse()
      //   break
      // }

      searchNode.list = CLOSED_LIST

      if (searchNode.y > 0) {
        this.checkAdjacentNode(
          instance,
          searchNode,
          0,
          -1,
          STRAIGHT_COST * this.getTileCost(searchNode.x, searchNode.y - 1),
        )
      }
      if (searchNode.x < this.collisionGrid[0].length - 1) {
        this.checkAdjacentNode(
          instance,
          searchNode,
          1,
          0,
          STRAIGHT_COST * this.getTileCost(searchNode.x + 1, searchNode.y),
        )
      }
      if (searchNode.y < this.collisionGrid.length - 1) {
        this.checkAdjacentNode(
          instance,
          searchNode,
          0,
          1,
          STRAIGHT_COST * this.getTileCost(searchNode.x, searchNode.y + 1),
        )
      }
      if (searchNode.x > 0) {
        this.checkAdjacentNode(
          instance,
          searchNode,
          -1,
          0,
          STRAIGHT_COST * this.getTileCost(searchNode.x - 1, searchNode.y),
        )
      }
    }

    return { path, instance }
  }

  checkAdjacentNode = (instance, searchNode, x, y, cost) => {
    const adjacentCoordinateX = searchNode.x + x
    const adjacentCoordinateY = searchNode.y + y

    if (
      (!this.pointsToAvoid[adjacentCoordinateY] ||
        !this.pointsToAvoid[adjacentCoordinateY][adjacentCoordinateX]) &&
      this.isTileWalkable(adjacentCoordinateX, adjacentCoordinateY, searchNode)
    ) {
      const node = this.coordinateToNode(
        instance,
        adjacentCoordinateX,
        adjacentCoordinateY,
        searchNode,
        cost,
      )

      if (node.list === undefined) {
        node.list = OPEN_LIST
        instance.openList.push(node)
      } else if (searchNode.costSoFar + cost < node.costSoFar) {
        node.costSoFar = searchNode.costSoFar + cost
        node.parent = searchNode
        instance.openList.updateItem(node)
      }
    }
  }

  isTileWalkable = (x, y, sourceNode) => {
    const directionalCondition =
      this.directionalConditions[y] && this.directionalConditions[y][x]
    if (directionalCondition) {
      const direction = this.calculateDirection(
        sourceNode.x - x,
        sourceNode.y - y,
      )
      const directionIncluded = () => {
        for (let i = 0; i < directionalCondition.length; i++) {
          if (directionalCondition[i] === direction) return true
        }
        return false
      }
      if (!directionIncluded()) return false
    }
    for (let i = 0; i < this.acceptableTiles.length; i++) {
      if (this.collisionGrid[y][x] === this.acceptableTiles[i]) {
        return true
      }
    }

    return false
  }

  /**
   * -1, -1 | 0, -1  | 1, -1
   * -1,  0 | SOURCE | 1,  0
   * -1,  1 | 0,  1  | 1,  1
   */
  calculateDirection = (diffX, diffY) => {
    if (diffX === 0 && diffY === -1) return PathFinder.TOP
    else if (diffX === 1 && diffY === 0) return PathFinder.RIGHT
    else if (diffX === 0 && diffY === 1) return PathFinder.BOTTOM
    else if (diffX === -1 && diffY === 0) return PathFinder.LEFT
    throw new Error('These differences are not valid: ' + diffX + ', ' + diffY)
  }

  getTileCost = (x, y) => {
    return (
      (this.pointsToCost[y] && this.pointsToCost[y][x]) ||
      this.costMap[this.collisionGrid[y][x]]
    )
  }

  coordinateToNode = (instance, x, y, parent, cost) => {
    if (instance.nodeHash[y]) {
      if (instance.nodeHash[y][x]) {
        return instance.nodeHash[y][x]
      }
    } else {
      instance.nodeHash[y] = {}
    }
    const simpleDistanceToTarget = this.getDistance(
      x,
      y,
      instance.endX,
      instance.endY,
    )
    let costSoFar = 0
    if (parent !== null) {
      costSoFar = parent.costSoFar + cost
    }
    const node = new Node(parent, x, y, costSoFar, simpleDistanceToTarget)
    instance.nodeHash[y][x] = node
    return node
  }

  getDistance = (x1, y1, x2, y2) => {
    // Manhattan distance
    const dx = Math.abs(x1 - x2)
    const dy = Math.abs(y1 - y2)
    return dx + dy
  }
}

module.exports = PathFinder
