// @flow

import { flow, map, identity, flattenDeep } from 'lodash/fp'
import type { Point as PointType } from './types'

/**
 * Transforms a nodeHash into array of Nodes
 * @param nodeHash
 * @returns {*}
 */
export const hashToArray = <T>(nodeHash: {
  [y: number]: { [x: number]: T },
}): Array<T> => {
  return flow([map(map(identity)), flattenDeep])(nodeHash)
}

/**
 * Returns true if passed points are at same position
 * @param point1
 * @param point2
 */
export const areSamePoint = (point1: PointType, point2: PointType) =>
  point1.x === point2.x && point1.y === point2.y
