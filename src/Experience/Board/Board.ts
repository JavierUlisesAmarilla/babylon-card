import * as BABYLON from 'babylonjs'

import {LAYER0_Z, LAYER1_Z} from '../../utils/constants';

import {Experience} from "../Experience";
import {Slot} from './Slot';

export class Board {
  experience: any
  scene: any
  mesh: any
  size: number = 10
  slotWidth: number = 1
  slotHeight: number = 1

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
    // this.mesh.rotation = new BABYLON.Vector3(Math.PI * 0.2, 0, 0)

    // Top slots
    const topSlots = new BABYLON.TransformNode('topSlots')
    topSlots.position.set(-1.16, 0.1, LAYER1_Z)
    topSlots.parent = this.mesh

    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const slot = new Slot(0.471, 0.77, x, y)
      slot.mesh.parent = topSlots
    }

    // Bottom slots
    const bottomSlots = new BABYLON.TransformNode('bottomSlots')
    bottomSlots.position.set(-1.16, -1.64, LAYER1_Z)
    bottomSlots.parent = this.mesh

    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const slot = new Slot(0.471, 0.77, x, y)
      slot.mesh.parent = bottomSlots
    }
  }
}