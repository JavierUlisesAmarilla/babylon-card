import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'

export class Slot {
  experience
  scene
  width
  height
  x
  y
  root

  constructor(width: number, height: number, x: number, y: number) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.root = BABYLON.MeshBuilder.CreatePlane('slot', {width: this.width, height: this.height}, this.scene)
    const material = new BABYLON.StandardMaterial('slot')
    material.diffuseTexture = new BABYLON.Texture('assets/images/slot.webp')
    this.root.material = material
    this.root.position.set(this.x * this.width + this.width / 2, this.y * this.height + this.height / 2, 0)
  }
}