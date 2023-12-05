import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'

export class Card {
  experience
  scene
  width
  height
  position
  texture
  mesh

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
    this.mesh = BABYLON.MeshBuilder.CreatePlane('card', {width: this.width, height: this.height}, this.scene)
    const material = new BABYLON.StandardMaterial('card')
    material.diffuseTexture = new BABYLON.Texture(this.texture)
    this.mesh.material = material
    this.mesh.position.copyFrom(this.position)
    // console.log('Card: this.mesh: ', this.mesh)
  }
}