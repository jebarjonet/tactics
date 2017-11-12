// @flow

import { times, random, sample, flattenDeep } from 'lodash/fp'
import type CoreType from 'engine/Core'
import Team from 'engine/game/Team'
import type TeamType from 'engine/game/Team'
import Player from 'engine/game/Player'
import type PlayerType from 'engine/game/Player'
import Action from 'engine/game/Action'
import type ActionType from 'engine/game/Action'

class GameState {
  core: CoreType
  teams: Array<TeamType>

  constructor(core: Object, teams: number = 2, playersPerTeam: number = 2) {
    this.core = core
    this.teams = this.createTeams(teams, playersPerTeam)
  }

  getTeams = (): Array<TeamType> => this.teams
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

  getPlayers = (): Array<PlayerType> =>
    flattenDeep(this.getTeams().map(team => team.getPlayers()))
  createPlayer = (width: number, height: number): PlayerType => {
    const actions = times(this.createAction, random(1, 3))
    return new Player(
      {
        x: random(0, width - 1),
        y: random(0, height - 1),
      },
      random(3, 5),
      random(1, 2),
      actions,
    )
  }

  createAction = (): ActionType => {
    const distance = sample([1, 1, 2, 3, 4])
    return new Action({
      distance,
      power: random(3, 8),
      zone: distance > 1 ? sample([0, 0, 0, 1, 2]) : 0,
    })
  }
}

export default GameState
