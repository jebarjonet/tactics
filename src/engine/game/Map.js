// @flow

import type { Grid as GridType } from 'engine/types'

class Map {
  grid: GridType
  height: number
  width: number

  constructor(grid: GridType) {
    this.grid = grid

    this.height = grid.length
    this.width = grid[0].length
  }

  getGrid = (): GridType => this.grid

  getHeight = (): number => this.height
  getWidth = (): number => this.width
}

export default Map
