import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'
import {GAP} from '../../utils/constants'

export class Card {
  experience
  scene
  gameState
  mouse
  root

  isPointerDown = false

  constructor({
    name, // Should be unique
    width,
    height,
    position,
    backTextureUrl
  }: {
    name: string
    width: number
    height: number
    position: BABYLON.Vector3
    backTextureUrl: string
  }) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.gameState = this.experience.gameState
    this.mouse = this.experience.mouse
    this.root = new BABYLON.TransformNode(name)
    this.root.position.copyFrom(position)
    this.root.rotation.y = Math.PI

    const back = BABYLON.MeshBuilder.CreatePlane(name, {width, height}, this.scene)
    back.parent = this.root
    const material = new BABYLON.StandardMaterial(name)
    material.diffuseTexture = new BABYLON.Texture(backTextureUrl)
    back.material = material
    back.position.z = GAP / 2
    back.rotation.y = Math.PI

    this.mouse.on('pointerDown', (root: BABYLON.Mesh) => {
      if (root.name === name) {
        this.isPointerDown = true

        if (this.gameState.step === 'select') {
          // TODO
        }
      }
    })

    this.mouse.on('pointerMove', (root: BABYLON.Mesh, diff: BABYLON.Vector3) => {
      if (root.name === name && this.isPointerDown && this.gameState.step === 'play') {
        this.root.position.addInPlace(diff)
      }
    })

    this.mouse.on('pointerUp', () => {
      this.isPointerDown = false
    })
  }

  animSelect () {
    // TODO
  }
}