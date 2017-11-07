import React, { Component } from 'react'
import _ from 'lodash/fp'

import Core from 'engine/core'

import { hashToArray } from './components/Grid'
import Grid from './components/Grid'

const gridSize = 20
const core = new Core(gridSize)

class App extends Component {
  state = { groups: [] }

  componentDidMount() {
    const startPoint = { x: 0, y: 0 }
    const endPoint = { x: gridSize - 1, y: gridSize - 1 }
    const t0 = performance.now()
    const { path, instance } = core.findPath(startPoint, endPoint)
    const t1 = performance.now()
    console.log(`Calculation done in ${(t1 - t0).toFixed(2)}ms`)
    if (!path) {
      console.log('Path was not found.')
      // path = [startPoint]
    } else {
      console.log(
        'Path was found. The first Point is ' + path[0].x + ' ' + path[0].y,
      )
      console.log(path, instance.nodeHash)
      const blockedNodes = _.flattenDeep(
        core.grid.map((row, y) =>
          row.map((cell, x) => ({
            value: cell,
            x,
            y,
          })),
        ),
      ).filter(node => node.value === 1)

      this.setState({
        groups: [
          [path[0], _.last(path)],
          path,
          hashToArray(instance.nodeHash),
          blockedNodes,
        ],
      })
    }
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
