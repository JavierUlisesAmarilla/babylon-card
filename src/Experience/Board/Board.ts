import * as BABYLON from 'babylonjs'

import {LAYER_BOARD_Z, LAYER_SLOT_Z} from '../../utils/constants'

import {Cards} from './Cards'
import {EmptySlot} from './EmptySlot'
import {Experience} from '../Experience'
import {Slot} from './Slot'

export class Board {
  experience
  scene
  mouse
  root
  topSlots
  bottomSlots
  topLeftSlot
  topRightSlot
  bottomLeftSlot
  bottomRightSlot
  cards

  size = 10
  slotWidth = 0.471
  slotHeight = 0.77

  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.mouse = this.experience.mouse
    this.root = BABYLON.MeshBuilder.CreatePlane('board', {width: this.size, height: this.size}, this.scene)
    const material = new BABYLON.StandardMaterial('board')
    material.diffuseTexture = new BABYLON.Texture('assets/images/background.jpg')
    this.root.material = material
    this.root.position.set(0, 0.8, LAYER_BOARD_Z)

    // Top slots
    this.topSlots = new BABYLON.TransformNode('topSlots')
    this.topSlots.parent = this.root
    this.topSlots.position.set(-1.16, 0.1, LAYER_SLOT_Z)

    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const slot = new Slot({width: this.slotWidth, height: this.slotHeight, x, y})
      slot.root.parent = this.topSlots
    }

    // Bottom slots
    this.bottomSlots = new BABYLON.TransformNode('bottomSlots')
    this.bottomSlots.parent = this.root
    this.bottomSlots.position.set(-1.16, -1.64, LAYER_SLOT_Z)

    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const slot = new Slot({width: this.slotWidth, height: this.slotHeight, x, y})
      slot.root.parent = this.bottomSlots
    }

    // Side slots
    this.topLeftSlot = new EmptySlot({width: this.slotWidth, height: this.slotHeight, position: new BABYLON.Vector3(-1.2 - this.slotWidth / 2, 0.9, LAYER_SLOT_Z)})
    this.topLeftSlot.root.parent = this.root
    this.topRightSlot = new EmptySlot({width: this.slotWidth, height: this.slotHeight, position: new BABYLON.Vector3(1.24 + this.slotWidth / 2, 0.9, LAYER_SLOT_Z)})
    this.topRightSlot.root.parent = this.root
    this.bottomLeftSlot = new EmptySlot({width: this.slotWidth, height: this.slotHeight, position: new BABYLON.Vector3(-1.2 - this.slotWidth / 2, -0.9, LAYER_SLOT_Z)})
    this.bottomLeftSlot.root.parent = this.root
    this.bottomRightSlot = new EmptySlot({width: this.slotWidth, height: this.slotHeight, position: new BABYLON.Vector3(1.24 + this.slotWidth / 2, -0.9, LAYER_SLOT_Z)})
    this.bottomRightSlot.root.parent = this.root

    // Cards
    this.cards = new Cards()
  }
}