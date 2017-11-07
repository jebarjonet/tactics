// @flow

export type Grid = Array<Array<number>>
export type Point = { x: number, y: number }
export type Node = Point & {
  costSoFar: number,
  list?: 0 | 1,
  parent: ?Node,
  simpleDistanceToTarget: number,
}
