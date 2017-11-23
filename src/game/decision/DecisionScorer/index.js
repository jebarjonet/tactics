// @flow

import { intersectionWith, maxBy } from 'lodash/fp'

import type CoreType from 'game/Core'
import type PlayerType from 'game/engine/Player'
import type ActionType from 'game/engine/Action'
import ActionScorer from './ActionScorer'
import type ActionScorerType from './ActionScorer'
import PositionScorer from './PositionScorer'
import type PositionScorerType from './PositionScorer'
import type { Node as NodeType } from 'game/types'
import { areSamePoint, hashToArray } from 'game/utils'

const ROUNDS = 10

export type AvailableDecisionType = {
  action: ActionType,
  actionScore?: number,
  positions: Array<NodeType>, // positions at which the action can reach target
  positionScore?: number,
  reachesTarget: boolean, // if action reaches target or not
  round: number,
  target: PlayerType,
}

export type SelectedDecisionType = {
  action: ActionType,
  actionScore: number,
  position: NodeType,
  positionScore: number,
  reachesTarget: boolean,
  round: number,
  score: number,
  target: PlayerType,
}

/**
 * Computes best decision to perform for a player
 */
class DecisionScorer {
  actionScorer: ActionScorerType
  core: CoreType
  player: PlayerType
  positionScorer: PositionScorerType

  constructor(core: CoreType) {
    this.actionScorer = new ActionScorer(this)
    this.core = core
    this.positionScorer = new PositionScorer(this)
  }

  getActionScorer = (): ActionScorerType => this.actionScorer

  getCore = (): CoreType => this.core

  getPlayer = (): PlayerType => this.player
  setPlayer = (player: PlayerType) => (this.player = player)
  getDecision = (): {
    decision: SelectedDecisionType,
    moveZone: { [y: number]: { [x: number]: NodeType } },
  } => {
    const { core, player } = this

    const players = core.getGameState().getPlayers()

    let otherPlayers = players
      .filter(p => p !== player)
      .filter(p => !p.isDead())

    // add other players as points to avoid for path finding
    core
      .getAnalyser()
      .getPathFinder()
      .stopAvoidingAllAdditionalPoints()
    otherPlayers.forEach(otherPlayer =>
      core
        .getAnalyser()
        .getPathFinder()
        .avoidAdditionalPoint(otherPlayer.getPosition()),
    )

    // player positions for 100 rounds
    const {
      zone: maximumPlayerMoveZone,
    }: {
      zone: { [y: number]: { [x: number]: NodeType } },
    } = core
      .getAnalyser()
      .findZone(player.getPosition(), player.getWalk() * ROUNDS)

    // maximum distance at which a player can reach another player with an action
    const playerMaxActionDistance = player.getMaxActionDistance()

    const decisions: Array<AvailableDecisionType> = []

    for (let round = 1; round <= ROUNDS; round++) {
      // zone where player can move for this round
      const playerMoveZone: Array<NodeType> = hashToArray(
        maximumPlayerMoveZone,
      ).filter(node => node.cost <= player.getWalk() * round)

      // include player in potential targets
      players.forEach(target => {
        // zone around target that player can reach if intersecting its move zone
        const maxActionDistanceZone: Array<NodeType> = hashToArray(
          core
            .getAnalyser()
            .coverZone(target.getPosition(), playerMaxActionDistance),
        )

        // cost of nodes in intersectionZone is distance to target from this node
        const intersectionZone = intersectionWith(
          areSamePoint,
          maxActionDistanceZone,
          playerMoveZone,
        )

        // if no intersection then player can not reach target at all
        if (intersectionZone.length === 0) {
          return
        }

        // can reach target on this round with at least one action
        player.getActions().forEach((action: ActionType) => {
          // nodes where player can reach target for this action
          // node.cost here is action distance (the higher the further from target)
          const positions = intersectionZone.filter(
            node => node.cost <= action.getFullDistance(),
          )

          // if no intersection then player can not reach target with this action
          if (positions.length === 0) {
            return
          }

          // can reach target on this round with this action
          decisions.push({
            action,
            reachesTarget: round === 1,
            positions,
            round,
            target,
          })
        })
      })
    }

    // score decision action
    // powerful action => better score
    decisions.forEach(decision => {
      decision.actionScore = this.scoreAction(decision)
    })

    // score decision position
    const positionedDecisions: Array<SelectedDecisionType> = []
    decisions.forEach(decision => {
      const { positions, ...rest } = decision
      positions.forEach(position => {
        const positionedDecision = {
          ...rest,
          position,
          positionScore: this.scorePosition(decision, position),
        }
        positionedDecisions.push({
          ...positionedDecision,
          score: this.score(positionedDecision),
        })
      })
    })

    let selectedDecision = maxBy('score')(positionedDecisions)

    // if selected decision can not reach this round
    // find another decision that reaches but is at same position as this one
    // so it keeps the intent of movement to another target but it actually acts this round
    if (!selectedDecision.reachesTarget) {
      const reachingDecisions = positionedDecisions.filter(
        decision =>
          decision.reachesTarget &&
          decision.position.x === selectedDecision.position.x &&
          decision.position.y === selectedDecision.position.y,
      )

      if (reachingDecisions.length > 0) {
        selectedDecision = maxBy('score')(reachingDecisions)
      }
    }

    // don't act if action score <= 0 (action is not wanted, better do nothing)
    if (selectedDecision.actionScore <= 0) {
      selectedDecision.reachesTarget = false
    }

    // return decision with best score
    return {
      decision: selectedDecision,
      moveZone: maximumPlayerMoveZone,
    }
  }
  scoreAction = (decision: AvailableDecisionType): number =>
    this.getActionScorer().score(decision)
  scorePosition = (
    decision: AvailableDecisionType,
    position: NodeType,
  ): number => this.getPositionScorer().score(decision, position)
  score = (decision: Object): number => {
    const score = decision.actionScore * decision.positionScore
    // high round => less score
    return Number((score * (1 / decision.round)).toFixed(6))
  }

  getPositionScorer = (): PositionScorerType => this.positionScorer
}

export default DecisionScorer
