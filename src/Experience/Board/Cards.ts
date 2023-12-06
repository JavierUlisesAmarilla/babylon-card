import * as BABYLON from 'babylonjs'

import {BOARD_ANGLE_FACTOR} from '../../utils/constants'
import {Card} from './Card'
import {Experience} from '../Experience'

export class Cards {
  experience
  scene
  root

  size = 10
  cardWidth = 0.38
  cardHeight = 0.66
  cardGap = 0.1
  cardArr: Card[] = []

  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.root = new BABYLON.TransformNode('cards')
    this.root.rotation.x = -Math.PI * BOARD_ANGLE_FACTOR
    const middleX = 2
    const middleY = 1

    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const card = new Card({
        name: `card${i}`,
        width: this.cardWidth,
        height: this.cardHeight,
        position: new BABYLON.Vector3((x - middleX) * (this.cardWidth + this.cardGap), (y - middleY) * (this.cardHeight + this.cardGap), -2),
        frontTextureUrl: `assets/images/avatars/(${i}).jpg`,
        backTextureUrl: `assets/images/cards/(${i}).webp`
      })
      card.root.parent = this.root // Let's change the parent of the selected card while playing
      this.cardArr.push(card)
    }
  }

  update() {
    const pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY)
    document.body.style.cursor = 'default'

    this.cardArr.forEach((card: Card) => {
      card.update()

      // Hover
      if (pickInfo?.pickedMesh?.name === card.name) {
        document.body.style.cursor = 'pointer'
      }
    })
  }
}