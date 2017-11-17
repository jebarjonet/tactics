// @flow

import { intersectionWith, maxBy } from 'lodash/fp'

import type CoreType from 'engine/Core'
import type PlayerType from 'engine/game/Player'
import type ActionType from 'engine/game/Action'
import type { Point as PointType, Node as NodeType } from 'engine/types'
import { areSamePoint, hashToArray } from 'engine/utils'

const ROUNDS = 10

type AvailableDecisionType = {
  action: ActionType,
  positions: Array<NodeType>, // positions at which the action can reach target
  round: number,
  score?: number,
  target: PlayerType,
}

type SelectedDecisionType = {
  action: ActionType,
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
  getDecision = (): SelectedDecisionType => {
    const { core, player } = this

    const players = core.getGameState().getPlayers()

    const otherPlayers = players
      .filter(p => p !== player)
      // temporarily target only enemies
      .filter(p => !player.hasSameTeamAs(p))
    // console.log('player', player)
    // console.log('enemies', otherPlayers)

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

        // cost of nodes in intersectionZone is distance from target from this node
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
            node => node.cost <= action.getDistance(),
          )

          // if no intersection then player can not reach target with this action
          if (positions.length === 0) {
            return
          }

          // can reach target on this round with this action
          decisions.push({
            positions,
            action,
            target,
            round,
          })
        })
      })
    }

    // score decision action
    // powerful action => better score
    decisions.forEach(decision => {
      decision.score = decision.action.getPower()
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

    // return decision with best score
    return maxBy('score')(positionedDecisions)

    // for a player
    // compute influence map
    // for X rounds (ponderer chaque action par numero de round)
    // - filter available positions
    // - pour chaque cible lister toutes les actions possibles
    // - scorer chaque action possible (score action)
    // - scorer chaque position de chaque action possible (score position)
    // determiner score final et prendre action avec meilleur score
  }
}

export default ActionScorer
