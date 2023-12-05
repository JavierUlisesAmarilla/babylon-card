import * as BABYLON from 'babylonjs'

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
    this.mesh.rotation = new BABYLON.Vector3(Math.PI * 0.2, 0, 0)

    // const topSlots = new BABYLON.TransformNode('topSlots')
    // topSlots.position.set(0, 0, 0)

    new Slot(1, 1, 0, 0)
  }
}