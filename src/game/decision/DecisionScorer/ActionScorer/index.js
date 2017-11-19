// @flow

import type DecisionScorerType, { AvailableDecisionType } from '../'

class ActionScorer {
  decisionScorer: DecisionScorerType

  constructor(decisionScorer: DecisionScorerType) {
    this.decisionScorer = decisionScorer
  }

  getDecisionScorer = (): DecisionScorerType => this.decisionScorer

  score = (decision: AvailableDecisionType): number => {
    const { action, target } = decision
    const damage = action.getDamage()
    const player = this.getDecisionScorer().getPlayer()
    const isAlly = player.isAlly(target)

    // do not attack allies
    if (isAlly && damage < 0) {
      return 0
    }

    // do not cure enemies
    if (!isAlly && damage > 0) {
      return 0
    }

    return Math.abs(damage)
  }
}

export default ActionScorer
