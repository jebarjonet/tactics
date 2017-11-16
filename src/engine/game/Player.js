// @flow

import { flow, map, max, random } from 'lodash/fp'
import type { Point as PointType } from 'engine/types'
import type TeamType from 'engine/game/Team'
import type ActionType from 'engine/game/Action'

class Player {
  actions: Array<ActionType>
  jump: number
  life: number
  maxLife: number
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
    this.maxLife = this.life
    this.position = position
    this.walk = walk
  }

  getActions = () => this.actions
  // returns the highest distance the player can act to
  getMaxActionDistance = (): number => {
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

  getLife = () => this.life
  setLife = (life: number): void => {
    if (life < 0) {
      this.life = 0
    } else if (life > this.maxLife) {
      this.life = this.maxLife
    } else {
      this.life = life
    }
  }
  addLife = (diff: number) => this.setLife(this.getLife() + diff)

  getMaxLife = () => this.maxLife
  setMaxLife = (maxLife: number) => (this.maxLife = maxLife)

  getPosition = () => this.position
  setPosition = (position: PointType) => (this.position = position)

  getTeam = () => this.team
  setTeam = (team: TeamType) => (this.team = team)
  hasSameTeamAs = (player: Player): boolean =>
    this.getTeam() === player.getTeam()

  getWalk = () => this.walk
  setWalk = (walk: number) => (this.walk = walk)

  // undergo action (decrease/increase plalife)
  undergoAction = (action: ActionType): void => {
    const initialPower = action.getPower()
    // calculate power variation
    const variation = Math.floor(initialPower * action.getVariation() / 100)
    // apply power variation
    const power = Math.floor(
      random(initialPower - variation, initialPower + variation),
    )
    this.addLife(power)
  }
}

export default Player
