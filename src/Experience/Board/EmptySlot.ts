import * as BABYLON from 'babylonjs'

import {Experience} from "../Experience";

export class EmptySlot {
  experience: any
  scene: any
  width: number
  height: number
  position: BABYLON.Vector3
  mesh: any

  constructor(width: number, height: number, position: BABYLON.Vector3) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.width = width
    this.height = height
    this.position = position
    this.init()
  }

  init() {
    this.mesh = BABYLON.MeshBuilder.CreatePlane('emptySlot', {width: this.width, height: this.height}, this.scene)
    this.mesh.material = new BABYLON.StandardMaterial('emptySlot')
    this.mesh.material.diffuseTexture = new BABYLON.Texture('assets/images/side-slot.webp')
    this.mesh.position.copyFrom(this.position)
  }
}