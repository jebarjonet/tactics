// @flow

import { flow, map, identity, flattenDeep } from 'lodash/fp'

import type { Node as NodeType } from './types'

/**
 * Transforms a nodeHash into array of Nodes
 * @param nodeHash
 * @returns {*}
 */
export const hashToArray = (nodeHash: {
  [y: number]: { [x: number]: NodeType },
}): Array<NodeType> => {
  return flow([map(map(identity)), flattenDeep])(nodeHash)
}
