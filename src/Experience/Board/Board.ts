import * as BABYLON from 'babylonjs'

import {LAYER0_Z, LAYER1_Z} from '../../utils/constants'

import {EmptySlot} from './EmptySlot'
import {Experience} from '../Experience'
import {Slot} from './Slot'

export class Board {
  experience: any
  scene: any
  mesh: any
  size = 10
  slotWidth = 0.471
  slotHeight = 0.77

  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.init()
  }

  init() {
    this.mesh = BABYLON.MeshBuilder.CreatePlane('board', {width: this.size, height: this.size}, this.scene)
    this.mesh.material = new BABYLON.StandardMaterial('board')
    this.mesh.material.diffuseTexture = new BABYLON.Texture('assets/images/background.jpg')
    this.mesh.position.z = LAYER0_Z
    this.mesh.rotation = new BABYLON.Vector3(Math.PI * 0.2, 0, 0)

    // Top slots
    const topSlots = new BABYLON.TransformNode('topSlots')
    topSlots.position.set(-1.16, 0.1, LAYER1_Z)
    topSlots.parent = this.mesh

    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const slot = new Slot(this.slotWidth, this.slotHeight, x, y)
      slot.mesh.parent = topSlots
    }

    // Bottom slots
    const bottomSlots = new BABYLON.TransformNode('bottomSlots')
    bottomSlots.position.set(-1.16, -1.64, LAYER1_Z)
    bottomSlots.parent = this.mesh

    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const slot = new Slot(this.slotWidth, this.slotHeight, x, y)
      slot.mesh.parent = bottomSlots
    }

    // Side slots
    const topLeftSlot = new EmptySlot(this.slotWidth, this.slotHeight, new BABYLON.Vector3(-1.2 - this.slotWidth / 2, 0.9, LAYER1_Z))
    topLeftSlot.mesh.parent = this.mesh
    const topRightSlot = new EmptySlot(this.slotWidth, this.slotHeight, new BABYLON.Vector3(1.24 + this.slotWidth / 2, 0.9, LAYER1_Z))
    topRightSlot.mesh.parent = this.mesh
    const bottomLeftSlot = new EmptySlot(this.slotWidth, this.slotHeight, new BABYLON.Vector3(-1.2 - this.slotWidth / 2, -0.9, LAYER1_Z))
    bottomLeftSlot.mesh.parent = this.mesh
    const bottomRightSlot = new EmptySlot(this.slotWidth, this.slotHeight, new BABYLON.Vector3(1.24 + this.slotWidth / 2, -0.9, LAYER1_Z))
    bottomRightSlot.mesh.parent = this.mesh
  }
}