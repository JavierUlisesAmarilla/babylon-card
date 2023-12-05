import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'

export class Slot {
  experience: any
  scene: any
  width: number
  height: number
  x: number
  y: number
  mesh: any

  constructor(width: number, height: number, x: number, y: number) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.init()
  }

  init() {
    this.mesh = BABYLON.MeshBuilder.CreatePlane('slot', {width: this.width, height: this.height}, this.scene)
    this.mesh.material = new BABYLON.StandardMaterial('slot')
    this.mesh.material.diffuseTexture = new BABYLON.Texture('assets/images/slot.webp')
    this.mesh.position.set(this.x * this.width + this.width / 2, this.y * this.height + this.height / 2, 0)
  }
}