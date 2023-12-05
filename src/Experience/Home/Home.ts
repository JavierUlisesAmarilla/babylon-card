import * as BABYLON from 'babylonjs'

import {Card} from '../Common/Card';
import {Experience} from "../Experience";
import {LAYER_HOME_Z} from '../../utils/constants';

export class Home {
  experience: any
  scene: any
  mesh: any
  size: number = 10
  cardWidth: number = 0.471
  cardHeight: number = 0.77
  cardGap: number = 0.1

  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.init()
  }

  init() {
    // Cards
    const cards = new BABYLON.TransformNode('cards')
    cards.position.set(0, 0, LAYER_HOME_Z)
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