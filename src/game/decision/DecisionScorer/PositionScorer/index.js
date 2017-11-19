// @flow

import type DecisionScorerType, { AvailableDecisionType } from '../'
import type { Node as NodeType } from 'game/types'

class PositionScorer {
  decisionScorer: DecisionScorerType

  constructor(decisionScorer: DecisionScorerType) {
    this.decisionScorer = decisionScorer
  }

  score = (decision: AvailableDecisionType, position: NodeType): number => {
    // node.cost here is action distance (the higher the further from target)
    // further from target => better score
    return position.cost
  }
}

export default PositionScorer
