import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'

export class EmptySlot {
  experience
  scene
  width
  height
  position
  mesh

  constructor(width: number, height: number, position: BABYLON.Vector3) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.width = width
    this.height = height
    this.position = position
    this.mesh = BABYLON.MeshBuilder.CreatePlane('emptySlot', {width: this.width, height: this.height}, this.scene)
    const material = new BABYLON.StandardMaterial('emptySlot')
    material.diffuseTexture = new BABYLON.Texture('assets/images/side-slot.webp')
    this.mesh.material = material
    this.mesh.position.copyFrom(this.position)
  }
}