import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'

export class Card {
  experience
  scene
  mouse
  width
  height
  position
  texture
  mesh

  isPlaying = false
  isPointerDown = false

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
    this.mouse = this.experience.mouse
    this.width = width
    this.height = height
    this.position = position
    this.texture = texture
    this.mesh = BABYLON.MeshBuilder.CreatePlane('card', {width: this.width, height: this.height}, this.scene)
    const material = new BABYLON.StandardMaterial('card')
    material.diffuseTexture = new BABYLON.Texture(this.texture)
    this.mesh.material = material
    this.mesh.position.copyFrom(this.position)

    this.mouse.on('pointerDown', (mesh: BABYLON.Mesh) => {
      if (mesh === this.mesh) {
        this.isPointerDown = true
      }
    })

    this.mouse.on('pointerMove', (mesh: BABYLON.Mesh, diff: BABYLON.Vector3) => {
      if (mesh === this.mesh && this.isPointerDown && this.isPlaying) {
        this.mesh.position.addInPlace(diff)
      }
    })

    this.mouse.on('pointerUp', () => {
      this.isPointerDown = false
    })
  }
}