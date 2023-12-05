import * as BABYLON from 'babylonjs'

import {LAYER_BOARD_Z, LAYER_CARD_Z, LAYER_SLOT_Z} from '../../utils/constants'

import {Cards} from './Cards'
import {EmptySlot} from './EmptySlot'
import {Experience} from '../Experience'
import {Slot} from './Slot'

export class Board {
  experience
  scene
  mouse
  root

  size = 10
  slotWidth = 0.471
  slotHeight = 0.77

  topLeftSlot!: EmptySlot
  topRightSlot!: EmptySlot
  bottomLeftSlot!: EmptySlot
  bottomRightSlot!: EmptySlot

  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.mouse = this.experience.mouse
    this.root = BABYLON.MeshBuilder.CreatePlane('board', {width: this.size, height: this.size}, this.scene)
    const material = new BABYLON.StandardMaterial('board')
    material.diffuseTexture = new BABYLON.Texture('assets/images/background.jpg')
    this.root.material = material
    this.root.position.z = LAYER_BOARD_Z

    // Layer1
    const layer1 = BABYLON.MeshBuilder.CreatePlane('layer1', {width: this.size, height: this.size}, this.scene)
    layer1.parent = this.root
    layer1.position.z = LAYER_SLOT_Z
    layer1.visibility = 0

    // Layer2
    const layer2 = BABYLON.MeshBuilder.CreatePlane('layer2', {width: this.size, height: this.size}, this.scene)
    layer2.parent = this.root
    layer2.position.z = LAYER_CARD_Z
    layer2.visibility = 0
    this.mouse.dragPlane = layer2

    // Top slots
    const topSlots = new BABYLON.TransformNode('topSlots')
    topSlots.parent = layer1
    topSlots.position.set(-1.16, 0.1, 0)

    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const slot = new Slot({width: this.slotWidth, height: this.slotHeight, x, y})
      slot.root.parent = topSlots
    }

    // Bottom slots
    const bottomSlots = new BABYLON.TransformNode('bottomSlots')
    bottomSlots.parent = layer1
    bottomSlots.position.set(-1.16, -1.64, 0)

    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const slot = new Slot({width: this.slotWidth, height: this.slotHeight, x, y})
      slot.root.parent = bottomSlots
    }

    // Side slots
    this.topLeftSlot = new EmptySlot({width: this.slotWidth, height: this.slotHeight, position: new BABYLON.Vector3(-1.2 - this.slotWidth / 2, 0.9, 0)})
    this.topLeftSlot.root.parent = layer1
    this.topRightSlot = new EmptySlot({width: this.slotWidth, height: this.slotHeight, position: new BABYLON.Vector3(1.24 + this.slotWidth / 2, 0.9, 0)})
    this.topRightSlot.root.parent = layer1
    this.bottomLeftSlot = new EmptySlot({width: this.slotWidth, height: this.slotHeight, position: new BABYLON.Vector3(-1.2 - this.slotWidth / 2, -0.9, 0)})
    this.bottomLeftSlot.root.parent = layer1
    this.bottomRightSlot = new EmptySlot({width: this.slotWidth, height: this.slotHeight, position: new BABYLON.Vector3(1.24 + this.slotWidth / 2, -0.9, 0)})
    this.bottomRightSlot.root.parent = layer1

    // Cards
    new Cards()
  }
}