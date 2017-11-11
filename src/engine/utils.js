// @flow

import { flow, map, identity, flattenDeep } from 'lodash/fp'

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
