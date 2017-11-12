// @flow

import type {
  Point as PointType,
  PlayerAction as PlayerActionType,
} from 'engine/types'
import type TeamType from 'engine/game/Team'

class Player {
  actions: Array<PlayerActionType>
  position: PointType
  team: TeamType

  constructor(position: PointType, actions: Array<PlayerActionType> = []) {
    this.actions = actions
    this.position = position
  }

  setTeam = (team: TeamType) => (this.team = team)
}

export default Player
