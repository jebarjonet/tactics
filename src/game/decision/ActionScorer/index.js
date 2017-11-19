// @flow

import { intersectionWith, maxBy } from 'lodash/fp'

import type CoreType from 'game/Core'
import type PlayerType from 'game/engine/Player'
import type ActionType from 'game/engine/Action'
import type { Point as PointType, Node as NodeType } from 'game/types'
import { areSamePoint, hashToArray } from 'game/utils'

const ROUNDS = 10

type AvailableDecisionType = {
  action: ActionType,
  actionReaches: boolean, // if action reaches target or not
  positions: Array<NodeType>, // positions at which the action can reach target
  round: number,
  score?: number,
  target: PlayerType,
}

type SelectedDecisionType = {
  action: ActionType,
  actionReaches: boolean,
  position: PointType,
  round: number,
  score: number,
  target: PlayerType,
}

class ActionScorer {
  core: CoreType
  player: PlayerType

  constructor(core: CoreType, player: PlayerType) {
    this.core = core
    this.player = player
  }

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
      .filter(p => p.isAlive())

    // add other players as points to avoid for pathfinding
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

    // temporarily target only enemies
    otherPlayers = otherPlayers.filter(p => !player.hasSameTeamAs(p))

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

      otherPlayers.forEach(target => {
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
            node => node.cost <= action.reachesAt(),
          )

          // if no intersection then player can not reach target with this action
          if (positions.length === 0) {
            return
          }

          // can reach target on this round with this action
          decisions.push({
            action,
            actionReaches: round === 1,
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
      decision.score = decision.actionReaches
        ? Math.abs(decision.action.getDamage())
        : 0
    })

    // score decision position
    const positionedDecisions: Array<SelectedDecisionType> = []
    decisions.forEach(({ positions, ...decision }) => {
      positions.forEach(position => {
        // node.cost here is action distance (the higher the further from target)
        // further from target => better score
        const score = Number(decision.score) + position.cost
        positionedDecisions.push({
          ...decision,
          position,
          // high round => less score
          score: Number((score * (1 / decision.round)).toFixed(3)),
        })
      })
    })

    let selectedDecision = maxBy('score')(positionedDecisions)

    // if selected decision can not reach this round
    // find another decision that reaches but is at same position as this one
    // so it keeps the intent of movement to another target but it actually acts this round
    if (!selectedDecision.actionReaches) {
      const reachingDecisions = positionedDecisions.filter(
        decision =>
          decision.actionReaches &&
          decision.position.x === selectedDecision.position.x &&
          decision.position.y === selectedDecision.position.y,
      )

      if (reachingDecisions.length > 0) {
        selectedDecision = maxBy('score')(reachingDecisions)
      }
    }

    // return decision with best score
    return {
      decision: selectedDecision,
      moveZone: maximumPlayerMoveZone,
    }
  }
}

export default ActionScorer
