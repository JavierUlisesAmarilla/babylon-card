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
  mesh

  size = 10
  slotWidth = 0.471
  slotHeight = 0.77

  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.mouse = this.experience.mouse
    this.mesh = BABYLON.MeshBuilder.CreatePlane('board', {width: this.size, height: this.size}, this.scene)
    const material = new BABYLON.StandardMaterial('board')
    material.diffuseTexture = new BABYLON.Texture('assets/images/background.jpg')
    this.mesh.material = material
    this.mesh.position.z = LAYER_BOARD_Z

    // Layer1
    const layer1 = BABYLON.MeshBuilder.CreatePlane('layer1', {width: this.size, height: this.size}, this.scene)
    layer1.parent = this.mesh
    layer1.position.z = LAYER_SLOT_Z
    layer1.visibility = 0
    this.mouse.dragPlane = layer1

    // Top slots
    const topSlots = new BABYLON.TransformNode('topSlots')
    topSlots.parent = layer1
    topSlots.position.set(-1.16, 0.1, 0)

    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const slot = new Slot(this.slotWidth, this.slotHeight, x, y)
      slot.mesh.parent = topSlots
    }

    // Bottom slots
    const bottomSlots = new BABYLON.TransformNode('bottomSlots')
    bottomSlots.parent = layer1
    bottomSlots.position.set(-1.16, -1.64, 0)

    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const slot = new Slot(this.slotWidth, this.slotHeight, x, y)
      slot.mesh.parent = bottomSlots
    }

    // Side slots
    const topLeftSlot = new EmptySlot(this.slotWidth, this.slotHeight, new BABYLON.Vector3(-1.2 - this.slotWidth / 2, 0.9, 0))
    topLeftSlot.mesh.parent = layer1
    const topRightSlot = new EmptySlot(this.slotWidth, this.slotHeight, new BABYLON.Vector3(1.24 + this.slotWidth / 2, 0.9, 0))
    topRightSlot.mesh.parent = layer1
    const bottomLeftSlot = new EmptySlot(this.slotWidth, this.slotHeight, new BABYLON.Vector3(-1.2 - this.slotWidth / 2, -0.9, 0))
    bottomLeftSlot.mesh.parent = layer1
    const bottomRightSlot = new EmptySlot(this.slotWidth, this.slotHeight, new BABYLON.Vector3(1.24 + this.slotWidth / 2, -0.9, 0))
    bottomRightSlot.mesh.parent = layer1

    // Cards
    new Cards()
  }
}