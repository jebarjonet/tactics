// @flow

import { sumBy } from 'lodash/fp'
import type PlayerType from 'game/engine/Player'
import type ActionType from 'game/engine/Action'

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
    if (isAlly && damage > 0) {
      return 0
    }

    // do not cure enemies
    if (!isAlly && damage < 0) {
      return 0
    }

    // player life

    const opportunityScore = this.getOpportunityScore(target, action)
    const dangerousnessScore = this.getDangerousnessScore(target)

    return opportunityScore * dangerousnessScore
  }

  /**
   * Returns score for interest to act on player
   * @param target
   * @param action
   * @returns {number}
   */
  getOpportunityScore = (target: PlayerType, action: ActionType): number => {
    // left life of player
    // base of 1.1 so we don't end with 1 - 1 = 0 when player is full life
    // todo: Exponential score
    const leftLifeScore = 1.1 - target.getLife() / target.getMaxLife()

    // will kill player on applying action on it
    // todo: consider curing actions
    const killOnActionScore =
      target.getLife() - action.getDamage() <= 0 ? 1 : 0.5

    return leftLifeScore * killOnActionScore
  }

  /**
   * Returns score for dangerousness of player
   * @param target
   * @returns {number}
   */
  getDangerousnessScore = (target: PlayerType): number => {
    const actions = target.getActions()

    // todo: do not return 0, we still want to consider this player even if he is harmless
    if (actions.length === 0) {
      return 0
    }

    // damage of actions of player (attack or cure actions)
    // todo: Linear score
    const damageScore =
      sumBy(action => Math.abs(action.getDamage()))(actions) / actions.length

    // full distance of actions of player
    // todo: Exponential score
    const distanceScore =
      sumBy(action => action.getFullDistance())(actions) / actions.length

    // walk distance of player
    // todo: Exponential score
    const walkScore = target.getWalk() + target.getJump()

    return damageScore * distanceScore * walkScore
  }
}

export default ActionScorer
