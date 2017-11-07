import React, { Component } from 'react'
import _ from 'lodash/fp'

import PathFinder from 'engine/pathfinder'

import { hashToArray } from './components/Grid'
import Grid from './components/Grid'

const pathFinder = new PathFinder()

const MAP_SIZE = 20

const grid = []
for (let i = 0; i < MAP_SIZE; i++) {
  grid[i] = []
  for (let j = 0; j < MAP_SIZE; j++) {
    grid[i][j] = _.sample([0, 0, 0, 1])
  }
}
grid[0][0] = 0
grid[MAP_SIZE / 2][MAP_SIZE / 2] = 0
grid[MAP_SIZE - 1][MAP_SIZE - 1] = 0

class App extends Component {
  state = { groups: [] }

  componentDidMount() {
    pathFinder.setGrid(grid)
    pathFinder.setAcceptableTiles([0])
    const preFindPath = performance.now()
    let { path, instance } = pathFinder.findPath(
      MAP_SIZE / 2,
      MAP_SIZE / 2,
      MAP_SIZE - 1,
      MAP_SIZE - 1,
    )
    const postFindPath = performance.now()
    console.log('Found path done: ' + (postFindPath - preFindPath) + 'ms')
    if (!path) {
      console.log('Path was not found.')
      path = [{ x: MAP_SIZE / 2, y: MAP_SIZE / 2 }]
    } else {
      console.log(
        'Path was found. The first Point is ' + path[0].x + ' ' + path[0].y,
      )
    }
    console.log(path, instance.nodeHash)
    const blockedNodes = _.flattenDeep(
      grid.map((row, y) =>
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

  render() {
    return (
      <div>
        <div>Running pathfinder</div>
        <Grid
          height={grid.length}
          width={grid[0].length}
          groups={this.state.groups}
        />
      </div>
    )
  }
}

export default App
