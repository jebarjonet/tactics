import React, { Component } from 'react'

import Core from 'engine/Core'
import Grid from 'components/Grid'

const gridSize = 28 // must be an even number

if (gridSize % 2 !== 0) {
  throw new Error('Grid size must be an even number')
}

const core = new Core(gridSize)

class App extends Component {
  state = { groups: [] }

  componentDidMount() {
    this.displayGameState()
  }

  displayGameState = () => {
    const state = core.getGameState()
    const actionScorer = core.getActionScorer()
    console.time('decision')
    const decision = actionScorer.getDecision()
    console.timeEnd('decision')
    console.log('decision', decision, actionScorer.getPlayer())
    const teams = state.getTeams()

    this.setState({
      groups: [
        [teams[0].getPlayers()[0].getPosition()],
        teams[0].getPlayers().map(player => player.getPosition()),
        teams[1].getPlayers().map(player => player.getPosition()),
        core.getTerrain().getUnwalkableZone(),
        [decision.position],
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
