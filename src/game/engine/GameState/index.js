// @flow

import { times, random, sample, flattenDeep } from 'lodash/fp'
import type CoreType from 'game/Core'
import Team from 'game/engine/Team'
import type TeamType from 'game/engine/Team'
import Player from 'game/engine/Player'
import type PlayerType from 'game/engine/Player'
import Action from 'game/engine/Action'
import type ActionType from 'game/engine/Action'

class GameState {
  core: CoreType
  teams: Array<TeamType>

  constructor(core: CoreType, teams: number = 2, playersPerTeam: number = 2) {
    this.core = core
    this.teams = this.createTeams(teams, playersPerTeam)
  }

  getCore = (): CoreType => this.core

  getTeams = (): Array<TeamType> => this.teams
  createTeams = (
    teams: number = 2,
    playersPerTeam: number = 2,
  ): Array<TeamType> => {
    return times(() => this.createTeam(playersPerTeam), teams)
  }
  createTeam = (playersPerTeam: number = 0): TeamType => {
    const team = new Team()
    const grid = this.core
      .getTerrain()
      .getWalklableMap()
      .getGrid()

    const height = grid.length

    if (!height) {
      throw new Error('You can no create a team on a grid with no height')
    }

    const width = grid[0].length

    if (!width) {
      throw new Error('You can no create a team on a grid with no width')
    }

    // add players to team
    times(() => {
      const player = this.createPlayer(width - 1, height - 1)
      team.addPlayer(player)
    }, playersPerTeam)

    return team
  }

  getPlayers = (): Array<PlayerType> =>
    flattenDeep(this.getTeams().map(team => team.getPlayers()))
  createPlayer = (maxX: number, maxY: number): PlayerType => {
    const actions = times(this.createAction, random(2, 3))
    return new Player(
      {
        x: random(0, maxX),
        y: random(0, maxY),
      },
      random(3, 5),
      random(1, 2),
      actions,
    )
  }
  removePlayer = (player: PlayerType) => {
    player.getTeam().removePlayer(player)
  }

  createAction = (): ActionType => {
    const distance = sample([1, 1, 2, 3, 4])
    return new Action({
      distance,
      damage: 4 - distance + random(1, 3),
      zone: distance > 1 ? sample([0, 0, 0, 1, 2]) : 0,
    })
  }
}

export default GameState
