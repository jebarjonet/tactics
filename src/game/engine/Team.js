// @flow

import type PlayerType from 'game/engine/Player'

class Team {
  players: Array<PlayerType> = []

  getPlayers = (): Array<PlayerType> => this.players
  setPlayers = (players: Array<PlayerType>) => (this.players = players)
  addPlayer = (player: PlayerType): void => {
    player.setTeam(this)
    this.players.push(player)
  }
  removePlayer = (player: PlayerType) => {
    this.setPlayers(this.players.filter(p => p !== player))
  }
}

export default Team
