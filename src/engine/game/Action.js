// @flow

class Action {
  distance: number // distance from player
  extension: number // zone effect distance
  power: number // power of action (negative is curing/positive is attacking)
  variation: number // percent of variation of power

  constructor({
    distance = 1,
    extension = 0,
    power = 0,
    variation = 8,
  }: {
    distance: number,
    extension: number,
    power: number,
    variation: number,
  }) {
    this.distance = distance
    this.extension = extension
    this.power = power
    this.variation = variation
  }
}

export default Action
