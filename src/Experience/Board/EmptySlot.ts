import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'

export class EmptySlot {
  experience
  scene
  root

  constructor({
    width,
    height,
    position
  }: {
    width: number,
    height: number,
    position: BABYLON.Vector3
  }) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.root = BABYLON.MeshBuilder.CreatePlane('emptySlot', {width, height}, this.scene)
    const material = new BABYLON.StandardMaterial('emptySlot')
    material.diffuseTexture = new BABYLON.Texture('assets/images/side-slot.webp')
    this.root.material = material
    this.root.position.copyFrom(position)
  }
}