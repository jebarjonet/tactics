// @flow

import type PlayerType from 'engine/game/Player'

class Team {
  players: Array<PlayerType> = []

  addPlayer = (player: PlayerType): void => {
    player.setTeam(this)
    this.players.push(player)
  }

  getPlayers = (): Array<PlayerType> => this.players
}

export default Team
