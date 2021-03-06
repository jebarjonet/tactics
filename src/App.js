import React, { Component } from 'react'
import { maxBy } from 'lodash/fp'

import { hashToArray } from 'game/utils'
import Core from 'game/Core'
import Grid from 'components/Grid'

const gridSize = 20 // must be an even number

if (gridSize % 2 !== 0) {
  throw new Error('Grid size must be an even number')
}

const core = new Core(gridSize)

const SPEED = 200
const MOVE_SPEED = SPEED / 1.5

class App extends Component {
  state = {
    currentPlayer: core.getGameState().getPlayers()[0],
    groups: [],
    preGroups: [],
  }

  componentDidMount() {
    core.getDecisionScorer().setPlayer(this.state.currentPlayer)
    this.round()
  }

  /**
   * Traverse every step of a round and display it on window
   * Todo: rewrite
   */
  round = () => {
    setTimeout(() => {
      const decisionScorer = core.getDecisionScorer()

      const { decision, moveZone } = decisionScorer.getDecision()

      // zone where player can move for this round
      const roundMoveZone = hashToArray(moveZone).filter(
        node => node.cost <= this.state.currentPlayer.getWalk(),
      )

      // display walkable zone for this round
      this.setState({
        preGroups: [
          {
            points: [decision.target.getPosition()],
            color: '#9300d9',
          },
        ],
        groups: [
          {
            points: roundMoveZone,
            color: '#6ba2d9',
          },
        ],
      })

      const finalPosition = moveZone[decision.position.y][decision.position.x]
      const path = core
        .getAnalyser()
        .getPathFinder()
        .buildPath(finalPosition)
      const roundPath = path.filter(
        node => node.cost <= this.state.currentPlayer.getWalk(),
      )
      const roundDestination = maxBy('cost')(roundPath)

      setTimeout(() => {
        // display destination zone for this round
        this.setState({
          groups: [
            {
              points: [roundDestination],
              color: '#106528',
            },
            {
              points: roundPath,
              color: '#4fcc6c',
            },
            {
              points: roundMoveZone,
              color: '#6ba2d9',
            },
          ],
        })

        // move to destination
        roundPath.forEach((point, index) => {
          setTimeout(() => {
            this.state.currentPlayer.setPosition(point)
            this.forceUpdate()
          }, MOVE_SPEED * index)
        })

        setTimeout(() => {
          const { action, reachesTarget, target } = decision

          if (reachesTarget) {
            // act on target
            const { damage } = target.applyAction(action)
            console.log(
              `Target at ${target.getPosition().x}:${
                target.getPosition().y
              } undergoes ${
                damage
              } (${target.getLife()}/${target.getMaxLife()} left)`,
            )

            if (target.isDead()) {
              console.log('Target dies!')
              core.getGameState().removePlayer(target)
              this.forceUpdate()
            }
          }

          setTimeout(() => {
            const alivePlayers = core
              .getGameState()
              .getPlayers()
              .filter(player => !player.isDead())

            if (
              alivePlayers.filter(p => !this.state.currentPlayer.isAlly(p))
                .length === 0
            ) {
              return console.log('END of game')
            }

            const currentPlayerIndex = alivePlayers.findIndex(
              player => this.state.currentPlayer === player,
            )
            const nextPlayerIndex =
              (currentPlayerIndex + 1) % alivePlayers.length

            // next player round
            const nextPlayer = alivePlayers[nextPlayerIndex]
            core.getDecisionScorer().setPlayer(nextPlayer)
            this.setState({
              currentPlayer: nextPlayer,
              groups: [],
            })
            this.round()
          }, SPEED)
        }, MOVE_SPEED * (roundPath.length + 1))
      }, SPEED)
    }, SPEED)
  }

  render() {
    const teams = core.getGameState().getTeams()

    const groups = [
      ...this.state.preGroups,
      {
        points: [this.state.currentPlayer.getPosition()],
        color: '#df8a00',
      },
      {
        points: teams[0].getPlayers().map(player => player.getPosition()),
        color: '#ccba71',
      },
      {
        points: teams[1].getPlayers().map(player => player.getPosition()),
        color: '#cc4342',
      },
      // display 3rd team if any
      // {
      //   points: teams[2].getPlayers().map(player => player.getPosition()),
      //   color: '#b20054',
      // },
      {
        points: core.getTerrain().getUnwalkableZone(),
        color: '#5d5d5d',
      },
      ...this.state.groups,
    ]

    return (
      <div style={{ padding: 20 }}>
        <p>Running pathfinder</p>
        <Grid height={gridSize} width={gridSize} groups={groups} />
      </div>
    )
  }
}

export default App
