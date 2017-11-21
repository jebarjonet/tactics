// @flow

import GameState from 'game/engine/GameState'
import type GameStateType from 'game/engine/GameState'
import TerrainAnalyser from 'game/analysis/TerrainAnalyser'
import type TerrainAnalyserType from 'game/analysis/TerrainAnalyser'
import Terrain from 'game/engine/Terrain'
import type TerrainType from 'game/engine/Terrain'
import DecisionScorer from 'game/decision/DecisionScorer'
import type DecisionScorerType from 'game/decision/DecisionScorer'
import MapsAnalyser from 'game/analysis/MapsAnalyser'

class Core {
  decisionScorer: DecisionScorerType
  gameState: GameStateType
  terrain: TerrainType
  terrainAnalyser: TerrainAnalyserType

  constructor(gridSize: number) {
    // set terrain and analysers
    this.terrain = new Terrain(gridSize)
    this.terrainAnalyser = new TerrainAnalyser(this.getTerrain())

    // start game state
    this.gameState = new GameState(this, 2, 3)

    // todo: use mapsAnalyser for influence maps
    // const mapsAnalyser = new MapsAnalyser(this)
    // console.log(
    //   mapsAnalyser.getAttractionMap(this.gameState.getPlayers()[0]).getGrid(),
    // )

    this.decisionScorer = new DecisionScorer(this)
  }

  getDecisionScorer = (): DecisionScorerType => this.decisionScorer
  getGameState = (): GameStateType => this.gameState
  getTerrain = (): TerrainType => this.terrain
  getAnalyser = (): TerrainAnalyserType => this.terrainAnalyser
}

export default Core
