import * as BABYLON from 'babylonjs'

import {CARD_TITLE_ARR} from '../../utils/constants'
import {Card} from './Card'
import {Experience} from '../Experience'

export class Cards {
  name = 'cards'
  experience
  size = 10
  cardWidth = 0.38
  cardHeight = 0.66
  cardGap = 0.3
  cardArr: Card[] = []

  constructor() {
    this.experience = new Experience()
    const middleX = 2
    const middleY = 1

    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const card = new Card({
        name: `card${i}`,
        index: i,
        width: this.cardWidth,
        height: this.cardHeight,
        position: new BABYLON.Vector3((x - middleX) * (this.cardWidth + this.cardGap), (middleY - y) * (this.cardHeight + this.cardGap) - this.cardHeight, 4),
        frontTextureUrl: `assets/images/avatars/(${i}).jpg`,
        backTextureUrl: `assets/images/cards/(${i}).webp`,
        tweakTimeout: Math.max(Math.random() * 1500, 800),
        backTitle: CARD_TITLE_ARR[i].back,
        frontTopTitle: CARD_TITLE_ARR[i].frontTop,
        frontBottomTitle: CARD_TITLE_ARR[i].frontBottom
      })
      card.root.parent = this.experience.ui.root
      this.cardArr.push(card)
    }
  }

  async animShowOnlyOneCard(cardIndex: number) {
    this.cardArr.forEach((card: Card, index: number) => {
      if (index !== cardIndex) {
        card.animHide()
      }
    })
  }

  update() {
    const pickInfo = this.experience.scene.pick(this.experience.scene.pointerX, this.experience.scene.pointerY)
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