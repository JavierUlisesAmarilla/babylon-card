import * as BABYLON from 'babylonjs'

import {Experience} from "../Experience";

export class Card {
  width: number
  height: number
  position: BABYLON.Vector3
  texture: string

  experience: any
  scene: any
  mesh: any

  constructor({
    width,
    height,
    position,
    texture
  }: {
    width: number
    height: number
    position: BABYLON.Vector3
    texture: string
  }) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.width = width
    this.height = height
    this.position = position
    this.texture = texture
    this.init()
  }

  init() {
    this.mesh = BABYLON.MeshBuilder.CreatePlane('card', {width: this.width, height: this.height}, this.scene)
    this.mesh.material = new BABYLON.StandardMaterial('card')
    this.mesh.material.diffuseTexture = new BABYLON.Texture(this.texture)
    this.mesh.position.copyFrom(this.position)
  }
}