// @flow

import type PlayerType from 'engine/game/Player'

class Team {
  players: Array<PlayerType> = []

  getPlayers = (): Array<PlayerType> => this.players
  setPlayers = (players: Array<PlayerType>) => (this.players = players)
  addPlayer = (player: PlayerType): void => {
    player.setTeam(this)
    this.players.push(player)
  }
}

export default Team
