import React, { Component } from 'react'
import _ from 'lodash/fp'

import Core from 'engine/core'

import Grid from './components/Grid'

const gridSize = 20
const core = new Core(gridSize)

class App extends Component {
  state = { groups: [] }

  componentDidMount() {
    // this.findPathExample()
    this.findZoneExample()
  }

  getUnwalkableTiles = () => {
    return _.flattenDeep(
      core.grid.map((row, y) =>
        row.map((cell, x) => ({
          value: cell,
          x,
          y,
        })),
      ),
    ).filter(node => node.value === 1)
  }

  findPathExample = () => {
    const startPoint = { x: 0, y: 0 }
    const endPoint = { x: gridSize - 1, y: gridSize - 1 }
    const t0 = performance.now()
    const { path, searchZone } = core.findPath(startPoint, endPoint)
    const t1 = performance.now()
    console.log(`Calculation PATH done in ${(t1 - t0).toFixed(2)}ms`)
    if (!path) {
      console.log('Path was not found.')
      // path = [startPoint]
    } else {
      console.log(
        'Path was found. The first Point is ' + path[0].x + ' ' + path[0].y,
      )
      console.log(path, searchZone)
      const blockedNodes = this.getUnwalkableTiles()
      this.setState({
        groups: [[startPoint, endPoint], path, blockedNodes, searchZone],
      })
    }
  }

  findZoneExample = () => {
    const startPoint = { x: gridSize / 2, y: gridSize / 2 }
    const distance = 6
    const t0 = performance.now()
    const { zone, extendedZone } = core.findZone(startPoint, distance, {
      extension: 3,
    })
    const t1 = performance.now()
    console.log(`Calculation ZONE done in ${(t1 - t0).toFixed(2)}ms`)
    console.log(zone)
    const blockedNodes = this.getUnwalkableTiles()
    this.setState({
      groups: [[startPoint], [], blockedNodes, zone, extendedZone],
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
