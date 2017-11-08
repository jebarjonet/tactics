// @flow

import Heap from 'heap'

import Instance from './instance'
import Node from './node'
import type {
  Grid as GridType,
  Point as PointType,
  Node as NodeType,
} from '../types'

type DirectionType = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT'
type InstanceType = Object

const CLOSED_LIST = 0
const OPEN_LIST = 1
const STRAIGHT_COST = 1

class PathFinder {
  acceptableTiles: Array<number>
  collisionGrid: GridType
  costMap: { [tileType: number]: number }
  directionalConditions: {
    [y: number]: { [x: number]: DirectionType },
  }
  iterationsPerCalculation: number
  pointsToAvoid: { [y: number]: { [x: number]: 1 } }
  pointsToCost: { [y: number]: { [x: number]: number } }

  static TOP = 'TOP'
  static RIGHT = 'RIGHT'
  static BOTTOM = 'BOTTOM'
  static LEFT = 'LEFT'

  constructor() {
    this.acceptableTiles = []
    this.collisionGrid = []
    this.costMap = {}
    this.directionalConditions = {}
    this.iterationsPerCalculation = Number.MAX_VALUE
    this.pointsToAvoid = {}
    this.pointsToCost = {}
  }

  /**
   * Sets the collision grid that PathFinder uses.
   *
   * @param {Array|Number} tiles An array of numbers that represent
   * which tiles in your grid should be considered
   * acceptable, or "walkable".
   **/
  setAcceptableTiles = (tiles: Array<number>) => {
    if (tiles instanceof Array) {
      // Array
      this.acceptableTiles = tiles
    } else if (!isNaN(parseFloat(tiles)) && isFinite(tiles)) {
      // Number
      this.acceptableTiles = [tiles]
    }
  }

  /**
   * Sets the collision grid that PathFinder uses.
   *
   * @param {Array} grid The collision grid that this PathFinder instance will read from.
   * This should be a 2D Array of Numbers.
   **/
  setGrid = (grid: GridType) => {
    this.collisionGrid = grid

    // setup cost map
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
   * @param {Number} x The x value of the point to cost.
   * @param {Number} y The y value of the point to cost.
   * @param {Number} value The cell value with the given tile.
   **/
  setGridPointValue = (x: number, y: number, value: number) => {
    this.collisionGrid[y][x] = value

    if (!this.costMap[this.collisionGrid[y][x]]) {
      this.costMap[this.collisionGrid[y][x]] = 1
    }
  }

  /**
   * Sets the tile cost for a particular tile type.
   *
   * @param {Number} tileType The tile type to set the cost for.
   * @param {Number} cost The multiplicative cost associated with the given tile.
   **/
  setTileCost = (tileType: number, cost: number) => {
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
  setAdditionalPointCost = (x: number, y: number, cost: number) => {
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
  removeAdditionalPointCost = (x: number, y: number) => {
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
  setDirectionalCondition = (
    x: number,
    y: number,
    allowedDirections: DirectionType,
  ) => {
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
  setIterationsPerCalculation = (iterations: number) => {
    this.iterationsPerCalculation = iterations
  }

  /**
   * Avoid a particular point on the grid,
   * regardless of whether or not it is an acceptable tile.
   *
   * @param {Number} x The x value of the point to avoid.
   * @param {Number} y The y value of the point to avoid.
   **/
  avoidAdditionalPoint = (x: number, y: number) => {
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
  stopAvoidingAdditionalPoint = (x: number, y: number) => {
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
   * @param {Object} startPoint The position of the starting point.
   * @param {Object} endPoint The position of the starting point.
   * @return {Object}
   *
   **/
  findPath = (startPoint: PointType, endPoint: PointType) => {
    // No acceptable tiles were set
    if (!this.acceptableTiles) {
      throw new Error(
        "You can't set a path without first calling setAcceptableTiles() on PathFinder.",
      )
    }

    // No grid was set
    if (!this.collisionGrid) {
      throw new Error(
        "You can't set a path without first calling setGrid() on PathFinder.",
      )
    }

    // Start or endpoint outside of scope.
    if (
      startPoint.x < 0 ||
      startPoint.y < 0 ||
      endPoint.x < 0 ||
      endPoint.y < 0 ||
      startPoint.x > this.collisionGrid[0].length - 1 ||
      startPoint.y > this.collisionGrid.length - 1 ||
      endPoint.x > this.collisionGrid[0].length - 1 ||
      endPoint.y > this.collisionGrid.length - 1
    ) {
      throw new Error(
        'Your start or end point is outside the scope of your grid.',
      )
    }

    // Start and end are the same tile.
    if (startPoint.x === endPoint.x && startPoint.y === endPoint.y) {
      return { path: [] }
    }

    // End point is not an acceptable tile.
    const endTile = this.collisionGrid[endPoint.y][endPoint.x]
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
    instance.startPoint = startPoint
    instance.endPoint = endPoint
    instance.openList.push(
      this.coordinateToNode(instance, startPoint, null, STRAIGHT_COST),
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

      // Handles the case where we have found the destination
      if (endPoint.x === searchNode.x && endPoint.y === searchNode.y) {
        path = []
        path.push({ x: searchNode.x, y: searchNode.y })
        let parent = searchNode.parent
        while (parent) {
          path.push({ x: parent.x, y: parent.y })
          parent = parent.parent
        }
        path.reverse()
        break
      }

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

  /**
   * Find a zone.
   *
   * @param {Object} startPoint The position of the starting point.
   * @param {Object} distance The distance travelled by finder
   * @return {Object}
   *
   **/
  findZone = (startPoint: PointType, distance: number) => {
    // No acceptable tiles were set
    if (!this.acceptableTiles) {
      throw new Error(
        "You can't set a path without first calling setAcceptableTiles() on PathFinder.",
      )
    }

    // No grid was set
    if (!this.collisionGrid) {
      throw new Error(
        "You can't set a path without first calling setGrid() on PathFinder.",
      )
    }

    // Start or endpoint outside of scope.
    if (
      startPoint.x < 0 ||
      startPoint.y < 0 ||
      startPoint.x > this.collisionGrid[0].length - 1 ||
      startPoint.y > this.collisionGrid.length - 1
    ) {
      throw new Error(
        'Your start or end point is outside the scope of your grid.',
      )
    }

    // Create the instance
    const instance = new Instance()
    instance.openList = new Heap(
      (nodeA, nodeB) => nodeA.bestGuessDistance() - nodeB.bestGuessDistance(),
    )
    instance.nodeHash = {}
    instance.startPoint = startPoint
    instance.openList.push(
      this.coordinateToNode(instance, startPoint, null, STRAIGHT_COST),
    )

    for (
      let iterationsSoFar = 0;
      iterationsSoFar < this.iterationsPerCalculation;
      iterationsSoFar++
    ) {
      // Couldn't find a path.
      if (instance.openList.size() === 0) {
        break
      }

      const searchNode = instance.openList.pop()

      // don't go further if distance is reached
      if (searchNode.costSoFar >= distance) {
        continue
      }

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

    return { instance }
  }

  checkAdjacentNode = (
    instance: InstanceType,
    searchNode: NodeType,
    x: number,
    y: number,
    cost: number,
  ) => {
    const adjacentCoordinateX = searchNode.x + x
    const adjacentCoordinateY = searchNode.y + y

    if (
      (!this.pointsToAvoid[adjacentCoordinateY] ||
        !this.pointsToAvoid[adjacentCoordinateY][adjacentCoordinateX]) &&
      this.isTileWalkable(adjacentCoordinateX, adjacentCoordinateY, searchNode)
    ) {
      const node = this.coordinateToNode(
        instance,
        {
          x: adjacentCoordinateX,
          y: adjacentCoordinateY,
        },
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

  isTileWalkable = (x: number, y: number, sourceNode: NodeType) => {
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
  calculateDirection = (diffX: number, diffY: number) => {
    if (diffX === 0 && diffY === -1) return PathFinder.TOP
    else if (diffX === 1 && diffY === 0) return PathFinder.RIGHT
    else if (diffX === 0 && diffY === 1) return PathFinder.BOTTOM
    else if (diffX === -1 && diffY === 0) return PathFinder.LEFT
    throw new Error('These differences are not valid: ' + diffX + ', ' + diffY)
  }

  getTileCost = (x: number, y: number) => {
    return (
      (this.pointsToCost[y] && this.pointsToCost[y][x]) ||
      this.costMap[this.collisionGrid[y][x]]
    )
  }

  coordinateToNode = (
    instance: InstanceType,
    point: PointType,
    parent: ?NodeType,
    cost: number,
  ): NodeType => {
    const { x, y } = point

    if (instance.nodeHash[y]) {
      if (instance.nodeHash[y][x]) {
        return instance.nodeHash[y][x]
      }
    } else {
      instance.nodeHash[y] = {}
    }
    const simpleDistanceToTarget = this.getDistance({ x, y }, instance.endPoint)
    let costSoFar = 0
    if (parent) {
      costSoFar = parent.costSoFar + cost
    }
    const node = new Node(parent, x, y, costSoFar, simpleDistanceToTarget)
    instance.nodeHash[y][x] = node
    return node
  }

  getDistance = (startPoint: PointType, endPoint: ?PointType) => {
    if (!endPoint) {
      return 1
    }

    // Manhattan distance
    const dx = Math.abs(startPoint.x - endPoint.x)
    const dy = Math.abs(startPoint.y - endPoint.y)
    return dx + dy
  }
}

export default PathFinder
