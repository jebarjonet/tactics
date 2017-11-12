// @flow

import { sample, flow, flattenDeep, filter } from 'lodash/fp'

import GameState from 'engine/game/GameState'
import type GameStateType from 'engine/game/GameState'
import TerrainAnalyser from 'engine/analysis/TerrainAnalyser'
import type TerrainAnalyserType from 'engine/analysis/TerrainAnalyser'
import type { Grid as GridType, Point as PointType } from 'engine/types'

class Core {
  gameState: GameStateType
  grid: GridType
  terrainAnalyser: TerrainAnalyserType

  constructor(gridSize: number) {
    // create grid
    this.grid = this.generateGrid(gridSize)

    this.gameState = new GameState(this)
    this.terrainAnalyser = new TerrainAnalyser(this.grid)
  }

  generateGrid = (size: number): GridType => {
    const grid = []

    // fill grid with cells
    for (let y = 0; y < size; y++) {
      grid[y] = []
      for (let x = 0; x < size; x++) {
        // set a random value in cell
        grid[y][x] = sample([0, 0, 0, 0, 0, 0, 0, 1])
      }
    }

    return grid
  }

  getGrid = (): GridType => this.grid

  getUnwalkableZone = (): Array<PointType> =>
    flow([
      grid =>
        grid.map((row, y) =>
          row.map((cell, x) => ({
            value: cell,
            x,
            y,
          })),
        ),
      flattenDeep,
      filter(node => node.value === 1),
    ])(this.getGrid())
}

export default Core
