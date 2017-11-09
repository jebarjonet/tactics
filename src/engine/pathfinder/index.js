// @flow

import Heap from 'heap'
import { clone, flow, reduce } from 'lodash/fp'

import { hashToArray } from '../utils'
import Instance from './instance'
import Node from './node'
import type {
  Grid as GridType,
  Point as PointType,
  ExtendedZonePoint as ExtendedZonePointType,
  Node as NodeType,
} from '../types'

// existing directions for nodes search
type DirectionType = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT'
// instance of search nodes
type InstanceType = Object
// result of path finding
export type FindPathType = {
  path: ?Array<NodeType>,
  searchZone?: Array<NodeType>,
}
// result of zone finding
export type FindZoneType = {
  zone: Array<NodeType>,
  extendedZone?: Array<ExtendedZonePointType>,
}

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
  setAcceptableTiles = (tiles: Array<number>): void => {
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
  setGrid = (grid: GridType): void => {
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
  setGridPointValue = ({ x, y }: PointType, value: number): void => {
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
  setTileCost = (tileType: number, cost: number): void => {
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
  setAdditionalPointCost = ({ x, y }: PointType, cost: number): void => {
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
  removeAdditionalPointCost = ({ x, y }: PointType): void => {
    if (this.pointsToCost[y]) {
      delete this.pointsToCost[y][x]
    }
  }

  /**
   * Remove all additional point costs.
   **/
  removeAllAdditionalPointCosts = (): void => {
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
    { x, y }: PointType,
    allowedDirections: DirectionType,
  ): void => {
    if (!this.directionalConditions[y]) {
      this.directionalConditions[y] = {}
    }
    this.directionalConditions[y][x] = allowedDirections
  }

  /**
   * Remove all directional conditions
   **/
  removeAllDirectionalConditions = (): void => {
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
  setIterationsPerCalculation = (iterations: number): void => {
    this.iterationsPerCalculation = iterations
  }

  /**
   * Avoid a particular point on the grid,
   * regardless of whether or not it is an acceptable tile.
   *
   * @param {Number} x The x value of the point to avoid.
   * @param {Number} y The y value of the point to avoid.
   **/
  avoidAdditionalPoint = ({ x, y }: PointType): void => {
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
  stopAvoidingAdditionalPoint = ({ x, y }: PointType): void => {
    if (this.pointsToAvoid[y]) {
      delete this.pointsToAvoid[y][x]
    }
  }

  /**
   * Stop avoiding all additional points on the grid.
   **/
  stopAvoidingAllAdditionalPoints = (): void => {
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
  findPath = (startPoint: PointType, endPoint: PointType): FindPathType => {
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
    if (this.pointIsOutOfGrid(startPoint) || this.pointIsOutOfGrid(endPoint)) {
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
      return { path: null }
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
        path.push(clone(searchNode))
        let parent = searchNode.parent
        while (parent) {
          path.push(clone(parent))
          parent = parent.parent
        }
        path.reverse()
        break
      }

      searchNode.list = CLOSED_LIST

      this.checkAdjacentNodes(instance, searchNode)
    }

    return { path, searchZone: hashToArray(instance.nodeHash), instance }
  }

  /**
   * Find a zone.
   *
   * @param {Object} startPoint The position of the starting point.
   * @param {Object} distance The distance travelled by finder
   * @param {Object} options Zone finder options
   * @return {Object}
   *
   **/
  findZone = (
    startPoint: PointType,
    distance: number,
    { extension = 0 }: { extension?: number },
  ): FindZoneType => {
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
    if (this.pointIsOutOfGrid(startPoint)) {
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
      // couldn't extend zone anymore
      if (instance.openList.size() === 0) {
        break
      }

      const searchNode = instance.openList.pop()

      // don't go further if distance is reached
      if (searchNode.cost >= distance) {
        continue
      }

      searchNode.list = CLOSED_LIST

      this.checkAdjacentNodes(instance, searchNode)
    }

    const result: FindZoneType = {
      instance,
      zone: hashToArray(instance.nodeHash),
    }

    if (extension) {
      result.extendedZone = this.extendZone(
        hashToArray(instance.nodeHash),
        extension,
      )
    }

    return result
  }

  /**
   * [Path finding] Checks nodes adjacent to central one
   * @param instance
   * @param searchNode
   */
  checkAdjacentNodes = (instance: InstanceType, searchNode: NodeType): void => {
    if (searchNode.y > 0) {
      this.checkAdjacentNode(
        instance,
        searchNode,
        0,
        -1,
        STRAIGHT_COST *
          this.getTileCost({ x: searchNode.x, y: searchNode.y - 1 }),
      )
    }
    if (searchNode.x < this.collisionGrid[0].length - 1) {
      this.checkAdjacentNode(
        instance,
        searchNode,
        1,
        0,
        STRAIGHT_COST *
          this.getTileCost({ x: searchNode.x + 1, y: searchNode.y }),
      )
    }
    if (searchNode.y < this.collisionGrid.length - 1) {
      this.checkAdjacentNode(
        instance,
        searchNode,
        0,
        1,
        STRAIGHT_COST *
          this.getTileCost({ x: searchNode.x, y: searchNode.y + 1 }),
      )
    }
    if (searchNode.x > 0) {
      this.checkAdjacentNode(
        instance,
        searchNode,
        -1,
        0,
        STRAIGHT_COST *
          this.getTileCost({ x: searchNode.x - 1, y: searchNode.y }),
      )
    }
  }

  /**
   * [Path finding] Adds/Updates node in list of traversed nodes
   * @param instance
   * @param searchNode
   * @param diffX
   * @param diffY
   * @param cost
   */
  checkAdjacentNode = (
    instance: InstanceType,
    searchNode: NodeType,
    diffX: number,
    diffY: number,
    cost: number,
  ): void => {
    const adjacentCoordinateX = searchNode.x + diffX
    const adjacentCoordinateY = searchNode.y + diffY

    if (
      (!this.pointsToAvoid[adjacentCoordinateY] ||
        !this.pointsToAvoid[adjacentCoordinateY][adjacentCoordinateX]) &&
      this.isTileWalkable(
        { x: adjacentCoordinateX, y: adjacentCoordinateY },
        searchNode,
      )
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
      } else if (searchNode.cost + cost < node.cost) {
        node.cost = searchNode.cost + cost
        node.parent = searchNode
        instance.openList.updateItem(node)
      }
    }
  }

  /**
   * Returns true if tile is walkable
   * @param x
   * @param y
   * @param sourceNode
   * @returns {boolean}
   */
  isTileWalkable = ({ x, y }: PointType, sourceNode: PointType): boolean => {
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
   * Returns direction constant for passed position differences
   * -1, -1 | 0, -1  | 1, -1
   * -1,  0 | SOURCE | 1,  0
   * -1,  1 | 0,  1  | 1,  1
   */
  calculateDirection = (diffX: number, diffY: number): DirectionType => {
    if (diffX === 0 && diffY === -1) return PathFinder.TOP
    else if (diffX === 1 && diffY === 0) return PathFinder.RIGHT
    else if (diffX === 0 && diffY === 1) return PathFinder.BOTTOM
    else if (diffX === -1 && diffY === 0) return PathFinder.LEFT
    throw new Error('These differences are not valid: ' + diffX + ', ' + diffY)
  }

  /**
   * Returns cost of tile at position
   * @param x
   * @param y
   * @returns {*}
   */
  getTileCost = ({ x, y }: PointType): number => {
    return (
      (this.pointsToCost[y] && this.pointsToCost[y][x]) ||
      this.costMap[this.collisionGrid[y][x]]
    )
  }

  /**
   * Transforms coordinate (x & y point) into node with cost
   * @param instance
   * @param point
   * @param parent
   * @param cost
   * @returns {*}
   */
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
      costSoFar = parent.cost + cost
    }
    const node = new Node(parent, x, y, costSoFar, simpleDistanceToTarget)
    instance.nodeHash[y][x] = node
    return node
  }

  /**
   * Returns Manhattan distance between two points
   * @param startPoint
   * @param endPoint
   * @returns {number}
   */
  getDistance = (startPoint: PointType, endPoint: ?PointType): number => {
    if (!endPoint) {
      return 1
    }

    const dx = Math.abs(startPoint.x - endPoint.x)
    const dy = Math.abs(startPoint.y - endPoint.y)
    return dx + dy
  }

  /**
   * Returns extended zone of passed zone on an extra distance
   * This extra distance runs without taking walkability into account
   * @param zone
   * @param distance
   * @returns {*}
   */
  extendZone = (
    zone: Array<NodeType> | Array<PointType>,
    distance: number,
  ): Array<ExtendedZonePointType> => {
    return flow([
      reduce((result, { x, y }: PointType): {
        [y: number]: { [x: number]: ExtendedZonePointType },
      } => {
        for (let diffY = -distance; diffY <= distance; diffY++) {
          if (!result[y + diffY]) {
            result[y + diffY] = {}
          }

          for (let diffX = -distance; diffX <= distance; diffX++) {
            const point: ExtendedZonePointType = {
              distance: 0,
              x: x + diffX,
              y: y + diffY,
              parent: { x, y },
            }

            // give up if point is out of grid
            if (this.pointIsOutOfGrid(point)) {
              continue
            }

            const distanceFromSource = this.getDistance({ x, y }, point)

            // give up if point is too far from source
            if (distanceFromSource > distance) {
              continue
            }

            point.distance = distanceFromSource

            // set point in hash if empty at its coordinates
            if (!result[point.y][point.x]) {
              result[point.y][point.x] = point
              continue
            }

            // update point in hash if less far from initial zone than already
            // present point
            if (point.distance < result[point.y][point.x].distance) {
              result[point.y][point.x] = point
            }
          }
        }
        return result
      }, {}),
      hashToArray,
    ])(zone)
  }

  /**
   * Returns true if point is out of grid
   * @param point
   * @returns {boolean}
   */
  pointIsOutOfGrid = (point: PointType): boolean => {
    return (
      point.x < 0 ||
      point.y < 0 ||
      point.x > this.collisionGrid[0].length - 1 ||
      point.y > this.collisionGrid.length - 1
    )
  }
}

export default PathFinder
