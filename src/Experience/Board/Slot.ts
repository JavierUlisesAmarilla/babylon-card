import * as BABYLON from 'babylonjs'

import {Experience} from "../Experience";

export class Slot {
  experience: any
  scene: any
  width: number
  height: number
  i: number
  j: number
  mesh: any

  constructor(width: number, height: number, i: number, j: number) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.width = width
    this.height = height
    this.i = i
    this.j = j
    this.init()
  }

  init() {
    this.mesh = BABYLON.MeshBuilder.CreatePlane('board', {width: this.width, height: this.height}, this.scene)
    this.mesh.rotation = new BABYLON.Vector3(Math.PI * 0.2, 0, 0)
    this.mesh.material = new BABYLON.StandardMaterial('board')
    this.mesh.material.diffuseTexture = new BABYLON.Texture('assets/images/slot.webp')
    this.mesh.position.set(0, 0.1, 0)
  }
}