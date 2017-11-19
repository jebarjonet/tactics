// @flow

class Action {
  distance: number // distance from player
  damage: number // damage of action (negative is attacking/positive is curing)
  variation: number // percent of variation of damage
  zone: number // zone effect distance

  constructor({
    distance = 1,
    damage = 0,
    variation = 8,
    zone = 0,
  }: {
    distance?: number,
    damage: number,
    variation?: number,
    zone?: number,
  }) {
    this.distance = distance
    this.damage = damage
    this.variation = variation
    this.zone = zone
  }

  getDistance = (): number => this.distance
  setDistance = (distance: number) => (this.distance = distance)
  // distance + zone effect
  getFullDistance = (): number => this.getDistance() + this.getZone()

  getDamage = (): number => this.damage
  setDamage = (damage: number) => (this.damage = damage)

  getVariation = (): number => this.variation
  setVariation = (variation: number) => (this.variation = variation)

  getZone = (): number => this.zone
  setZone = (zone: number) => (this.zone = zone)
}

export default Action
