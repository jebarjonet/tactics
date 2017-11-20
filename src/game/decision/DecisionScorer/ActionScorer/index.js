// @flow

import { clamp, flow, map, max } from 'lodash/fp'
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
    const leftLifeScore = 1.001 - target.getLife() / target.getMaxLife()

    // will kill player on applying action on it
    // todo: consider curing actions
    const killOnActionScore =
      target.getLife() - Math.abs(action.getDamage()) <= 0 ? 1 : 0.5

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

    const maxActionDangerousnessScore = flow([
      map(this.actionDangerousnessScore),
      max,
    ])(actions)

    // walk distance of player (max 10)
    // todo: Exponential score
    const walkScore = clamp(0.5, 1, (target.getWalk() + target.getJump()) / 10)

    return maxActionDangerousnessScore * walkScore
  }

  /**
   * Action dangerousness score
   * @param action
   */
  actionDangerousnessScore = (action: ActionType): number => {
    // damage score (max 10) (attack or cure actions)
    // todo: Linear score
    const damageScore = clamp(0, 1, Math.abs(action.getDamage()) / 10)

    // full distance score (max 8)
    // todo: Exponential score
    const distanceScore = clamp(0, 1, action.getFullDistance() / 8)

    // zone effect score (max 5)
    // todo: Exponential score
    const zoneScore = clamp(0.6, 1, action.getZone() / 5)

    return damageScore * distanceScore * zoneScore
  }
}

export default ActionScorer
