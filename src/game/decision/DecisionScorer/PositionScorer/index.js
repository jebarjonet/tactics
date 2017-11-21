// @flow

import { clamp } from 'lodash/fp'
import type DecisionScorerType, { AvailableDecisionType } from '../'
import type { Node as NodeType } from 'game/types'

/**
 * Score position of player when choosing which position to stand
 */
class PositionScorer {
  decisionScorer: DecisionScorerType

  constructor(decisionScorer: DecisionScorerType) {
    this.decisionScorer = decisionScorer
  }

  score = (decision: AvailableDecisionType, position: NodeType): number => {
    // node.cost here is action distance (the higher the further from target)
    // further from target => better score
    return clamp(0.5, 1, position.cost / 8)
  }
}

export default PositionScorer
