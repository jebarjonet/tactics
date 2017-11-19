// @flow

import { forEach } from 'lodash/fp'
import { convertRange } from 'game/utils'
import type { Grid as GridType, Point as PointType } from 'game/types'
import type CoreType from 'game/Core'
import Map from 'game/engine/Map'
import MapType from 'game/engine/Map'
import PlayerType from 'game/engine/Player'

class MapsAnalyser {
  core: CoreType

  constructor(core: CoreType) {
    this.core = core
  }

  getCore = (): CoreType => this.core

  initializeGrid = (value: number = 0) => {
    const terrain = this.core.getTerrain()
    const grid = []

    for (let y = 0; y < terrain.getHeight(); y++) {
      grid[y] = []
      for (let x = 0; x < terrain.getWidth(); x++) {
        grid[y][x] = value
      }
    }

    return grid
  }

  getAttractionMap = (currentPlayer: PlayerType): MapType => {
    const players = this.getCore()
      .getGameState()
      .getPlayers()
    const grid = this.initializeGrid()

    players.forEach(player => {
      const isAlly = currentPlayer.isAlly(player)

      if (isAlly) {
        return
      }

      const influenceZone = this.getCore()
        .getAnalyser()
        .coverZone(player.getPosition(), 5)

      forEach(row => {
        forEach(({ cost, x, y }: Object) => {
          grid[y][x] += 6 - cost
        }, row)
      }, influenceZone)
    })

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        grid[y][x] = Number(
          convertRange(grid[y][x], [0, 5 * 3], [0, 1]).toFixed(2),
        )
      }
    }

    return new Map(grid)
  }
}

export default MapsAnalyser
