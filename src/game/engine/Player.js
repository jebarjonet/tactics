// @flow

import { flow, map, max, random } from 'lodash/fp'
import type { Point as PointType } from 'game/types'
import type TeamType from 'game/engine/Team'
import type ActionType from 'game/engine/Action'

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

    return flow([map(action => action.getFullDistance()), max])(actions)
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
  isDead = (): boolean => this.getLife() <= 0

  getMaxLife = () => this.maxLife
  setMaxLife = (maxLife: number) => (this.maxLife = maxLife)

  getPosition = () => this.position
  setPosition = (position: PointType) => (this.position = position)

  getTeam = () => this.team
  setTeam = (team: TeamType) => (this.team = team)
  isAlly = (player: Player): boolean => this.getTeam() === player.getTeam()

  getWalk = () => this.walk
  setWalk = (walk: number) => (this.walk = walk)

  // apply action on player (decrease/increase player's life)
  applyAction = (
    action: ActionType,
  ): {
    damage: number, // damage undergone by player
  } => {
    const initialDamage = action.getDamage()
    // calculate damage variation
    const variation = Math.floor(initialDamage * action.getVariation() / 100)
    // apply damage variation
    const damage = Math.floor(
      random(initialDamage - variation, initialDamage + variation),
    )
    this.addLife(-damage)
    return { damage }
  }
}

export default Player
