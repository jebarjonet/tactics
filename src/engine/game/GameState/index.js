// @flow

import { times, random } from 'lodash/fp'
import type CoreType from 'engine/Core'
import Player from 'engine/game/Player'
import type PlayerType from 'engine/game/Player'
import Team from 'engine/game/Team'
import type TeamType from 'engine/game/Team'

class GameState {
  core: CoreType
  teams: Array<TeamType>

  constructor(core: Object, teams: number = 2, playersPerTeam: number = 2) {
    this.core = core
    this.teams = this.createTeams(teams, playersPerTeam)
  }

  createTeams = (
    teams: number = 2,
    playersPerTeam: number = 2,
  ): Array<TeamType> => {
    return times(() => this.createTeam(playersPerTeam), teams)
  }

  createTeam = (playersPerTeam: number = 0): TeamType => {
    const team = new Team()
    const grid = this.core.getGrid()

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
      const player = this.createPlayer(width, height)
      team.addPlayer(player)
    }, playersPerTeam)

    return team
  }

  getTeams = (): Array<TeamType> => this.teams

  createPlayer = (width: number, height: number): PlayerType => {
    return new Player({
      x: random(0, width - 1),
      y: random(0, height - 1),
    })
  }
}

export default GameState
