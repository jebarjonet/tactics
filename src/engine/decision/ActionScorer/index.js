// @flow

import type CoreType from 'engine/Core'
import type PlayerType from 'engine/game/Player'

class ActionScorer {
  core: CoreType
  player: PlayerType

  constructor(core: CoreType, player: PlayerType) {
    this.core = core
    this.player = player
  }

  evaluate = () => {
    // for a player
    // update influence map
    // for X rounds (ponderer chaque action par numero de round)
    // - filter available positions
    // - pour chaque cible lister toutes les actions possibles
    // - scorer chaque action possible
    // prendre meilleure decision et si plusieurs positions possibles pour cette action, utiliser map d'influence
  }
}

export default ActionScorer
