// @flow

export type Grid = Array<Array<number>>
// simple coordinate point
export type Point = { x: number, y: number }
// point with cost
export type CostPoint = Point & {
  cost: number,
}
// algorithmic node for search
export type Node = CostPoint & {
  list?: 0 | 1,
  parent: ?Node,
  simpleDistanceToTarget: number,
}
