// @flow

export type Grid = Array<Array<number>>
// simple coordinate point
export type Point = { x: number, y: number }
// point used to track extended zone distance from initial zone
export type ExtendedZonePoint = Point & {
  distance: number, // distance from source
  parent?: Point, // cost is relative to parent if parent (extended zone)
}
// algorithmic node for search
export type Node = Point & {
  cost: number,
  list?: 0 | 1,
  parent: ?Node,
  simpleDistanceToTarget: number,
}

// player action
export type Action = {}
