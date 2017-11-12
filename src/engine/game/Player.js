// @flow

import { flow, map, max } from 'lodash/fp'
import type { Point as PointType, Action as ActionType } from 'engine/types'
import type TeamType from 'engine/game/Team'

class Player {
  actions: Array<ActionType>
  jump: number
  life: number
  position: PointType
  team: TeamType
  walk: number

  constructor(
    position: PointType,
    walk: number,
    jump: number,
    actions: Array<ActionType> = [],
  ) {
    this.actions = actions
    this.jump = jump
    this.life = 20
    this.position = position
    this.walk = walk
  }

  getActions = () => this.actions
  getMaxActionDistance = () => {
    const actions = this.getActions()

    if (actions.length === 0) {
      return 0
    }

    return flow([map(action => action.getDistance() + action.getZone()), max])(
      actions,
    )
  }
  setActions = (actions: Array<ActionType>) => (this.actions = actions)
  addAction = (action: ActionType) => this.actions.push(action)

  getJump = () => this.jump
  setJump = (jump: number) => (this.jump = jump)

  getPosition = () => this.position
  setPosition = (position: PointType) => (this.position = position)

  getTeam = () => this.team
  setTeam = (team: TeamType) => (this.team = team)

  getWalk = () => this.walk
  setWalk = (walk: number) => (this.walk = walk)
}

export default Player
