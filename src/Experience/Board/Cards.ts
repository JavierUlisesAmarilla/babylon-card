import * as BABYLON from 'babylonjs'

import {Card} from './Card'
import {Experience} from '../Experience'

export class Cards {
  experience
  scene

  size = 10
  cardWidth = 0.471
  cardHeight = 0.77
  cardGap = 0.1

  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    const cards = new BABYLON.TransformNode('cards')
    cards.position.set(0, -1.5, -2)
    cards.rotation.x = -Math.PI * 0.2
    const middleX = 2
    const middleY = 1

    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const card = new Card({
        width: this.cardWidth,
        height: this.cardHeight,
        position: new BABYLON.Vector3((x - middleX) * (this.cardWidth + this.cardGap), (y - middleY) * (this.cardHeight + this.cardGap), 0),
        texture: `assets/images/cards/(${i}).webp`
      })
      card.mesh.parent = cards
    }
  }
}