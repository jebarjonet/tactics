import React, { Component } from 'react'

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
    this.findZoneExample()
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
    const startPoint3 = { x: 15, y: 5 }
    let t0 = performance.now()
    const { zone = [] } = core.terrainAnalyser.findZone(startPoint, 3)
    let t1 = performance.now()
    console.log(`Calculation ZONE done in ${(t1 - t0).toFixed(2)}ms`)

    t0 = performance.now()
    const zone2 = core.terrainAnalyser.coverZone(startPoint2, 5)
    t1 = performance.now()
    console.log(`Calculation ZONE 2 done in ${(t1 - t0).toFixed(2)}ms`)

    t0 = performance.now()
    const zone3 = core.terrainAnalyser.coverZone(startPoint3, 5)
    t1 = performance.now()
    console.log(`Calculation ZONE COVER done in ${(t1 - t0).toFixed(2)}ms`)

    const blockedNodes = core.getUnwalkableZone()
    this.setState({
      groups: [
        [startPoint],
        [startPoint2, startPoint3],
        blockedNodes,
        zone,
        zone2,
        [],
        zone3,
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
