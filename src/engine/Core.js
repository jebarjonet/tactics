// @flow

import GameState from 'engine/game/GameState'
import type GameStateType from 'engine/game/GameState'
import TerrainAnalyser from 'engine/analysis/TerrainAnalyser'
import type TerrainAnalyserType from 'engine/analysis/TerrainAnalyser'
import Terrain from 'engine/game/Terrain'
import type TerrainType from 'engine/game/Terrain'
import MapsAnalyser from 'engine/analysis/MapsAnalyser'

class Core {
  gameState: GameStateType
  terrain: TerrainType
  terrainAnalyser: TerrainAnalyserType

  constructor(gridSize: number) {
    // set terrain and analysers
    this.terrain = new Terrain(gridSize)
    this.terrainAnalyser = new TerrainAnalyser(this.getTerrain())

    // start game state
    this.gameState = new GameState(this, 2, 3)

    const mapsAnalyser = new MapsAnalyser(this)
    console.log(
      mapsAnalyser.getAttractionMap(this.gameState.getPlayers()[0]).getGrid(),
    )
  }

  getGameState = (): GameStateType => this.gameState
  getTerrain = (): TerrainType => this.terrain
  getAnalyser = (): TerrainAnalyserType => this.terrainAnalyser
}

export default Core
