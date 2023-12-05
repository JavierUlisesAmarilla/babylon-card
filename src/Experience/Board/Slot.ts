import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'

export class Slot {
  experience
  scene
  root

  constructor({
    width,
    height,
    x,
    y
  }: {
    width: number
    height: number
    x: number
    y: number
  }) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.root = BABYLON.MeshBuilder.CreatePlane('slot', {width, height}, this.scene)
    const material = new BABYLON.StandardMaterial('slot')
    material.diffuseTexture = new BABYLON.Texture('assets/images/slot.webp')
    this.root.material = material
    this.root.position.set(x * width + width / 2, y * height + height / 2, 0)
  }
}