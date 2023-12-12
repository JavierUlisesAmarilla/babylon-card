import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'

export class EmptySlot {
  experience
  root

  constructor({
    name, // Should be unique
    width,
    height,
    position
  }: {
    name: string
    width: number
    height: number
    position: BABYLON.Vector3
  }) {
    this.experience = new Experience()
    this.root = BABYLON.MeshBuilder.CreatePlane(name, {width, height}, this.experience.scene)
    const material = new BABYLON.StandardMaterial(name)
    material.diffuseTexture = new BABYLON.Texture('assets/images/side-slot.webp')
    this.root.material = material
    this.root.position.copyFrom(position)
  }
}