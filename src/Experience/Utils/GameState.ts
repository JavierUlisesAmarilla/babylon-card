/* eslint-disable @typescript-eslint/no-this-alias */
let instance: GameState

export class GameState {
  step = 'select' // select, play

  constructor() {
    if (instance) {
      return instance
    }

    instance = this
  }
}