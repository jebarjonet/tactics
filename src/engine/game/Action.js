// @flow

class Action {
  distance: number // distance from player
  power: number // power of action (negative is curing/positive is attacking)
  variation: number // percent of variation of power
  zone: number // zone effect distance

  constructor({
    distance = 1,
    power = 0,
    variation = 8,
    zone = 0,
  }: {
    distance?: number,
    power: number,
    variation?: number,
    zone?: number,
  }) {
    this.distance = distance
    this.power = power
    this.variation = variation
    this.zone = zone
  }

  getDistance = (): number => this.distance
  setDistance = (distance: number) => (this.distance = distance)

  getPower = (): number => this.power
  setPower = (power: number) => (this.power = power)

  getVariation = (): number => this.variation
  setVariation = (variation: number) => (this.variation = variation)

  getZone = (): number => this.zone
  setZone = (zone: number) => (this.zone = zone)
}

export default Action
