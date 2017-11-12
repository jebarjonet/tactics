import React, { Component } from 'react'
import { flattenDeep, intersectionWith } from 'lodash/fp'

import { areSamePoint } from 'engine/utils'
import Core from 'engine/Core'
import Grid from 'components/Grid'

const gridSize = 20 // must be an even number

if (gridSize % 2 !== 0) {
  throw new Error('Grid size must be an even number')
}

const core = new Core(gridSize)

class App extends Component {
  state = { groups: [] }

  componentDidMount() {
    // this.findPathExample()
    // this.findZoneExample()
    this.displayGameState()
  }

  findPathExample = () => {
    const startPoint = { x: 0, y: 0 }
    const endPoint = { x: gridSize - 1, y: gridSize - 1 }
    const t0 = performance.now()
    const { path, searchZone } = core.terrainAnalyser.findPath(
      startPoint,
      endPoint,
    )
    const t1 = performance.now()
    console.log(`Calculation PATH done in ${(t1 - t0).toFixed(2)}ms`)
    if (!path) {
      console.log('Path was not found.')
    } else {
      console.log('Path was found')
      const blockedNodes = core.getUnwalkableZone()
      this.setState({
        groups: [[startPoint, endPoint], path, blockedNodes, searchZone],
      })
    }
  }

  findZoneExample = () => {
    const startPoint = { x: 12, y: 13 }
    const startPoint2 = { x: 6, y: 8 }

    let t0 = performance.now()
    const { zone = [] } = core.terrainAnalyser.findZone(startPoint, 3)
    let t1 = performance.now()
    console.log(`Calculation ZONE done in ${(t1 - t0).toFixed(2)}ms`)

    t0 = performance.now()
    const zone2 = core.terrainAnalyser.coverZone(startPoint2, 5)
    t1 = performance.now()
    console.log(`Calculation ZONE 2 done in ${(t1 - t0).toFixed(2)}ms`)

    const blockedNodes = core.getUnwalkableZone()
    this.setState({
      groups: [[startPoint], [startPoint2], blockedNodes, zone, zone2],
    })
  }

  displayGameState = () => {
    const { gameState: state } = core
    let t0 = performance.now()
    const teams = state.getTeams()
    const players = state.getPlayers()
    console.log('players', players)
    const currentPlayer = players[0]
    const otherPlayers = players.slice(1)
    const { zone: currentPlayerMoveZone } = core.terrainAnalyser.findZone(
      currentPlayer.getPosition(),
      currentPlayer.getWalk(),
    )
    const currentPlayerActionsZone = flattenDeep(
      otherPlayers.map(player =>
        core.terrainAnalyser.coverZone(
          player.getPosition(),
          currentPlayer.getMaxActionDistance(),
        ),
      ),
    )
    const intersectionsZone = intersectionWith(
      areSamePoint,
      currentPlayerMoveZone,
      currentPlayerActionsZone,
    )
    let t1 = performance.now()
    console.log(`Calculation done in ${(t1 - t0).toFixed(2)}ms`)

    this.setState({
      groups: [
        teams[0].getPlayers().map(player => player.getPosition()),
        teams[1].getPlayers().map(player => player.getPosition()),
        core.getUnwalkableZone(),
        intersectionsZone,
        currentPlayerMoveZone,
        currentPlayerActionsZone,
      ],
    })
  }

  render() {
    return (
      <div style={{ padding: 20 }}>
        <p>Running pathfinder</p>
        <Grid height={gridSize} width={gridSize} groups={this.state.groups} />
      </div>
    )
  }
}

export default App
