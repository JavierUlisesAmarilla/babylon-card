import * as BABYLON from 'babylonjs'

import {BOARD_ANGLE_FACTOR, GAP, LAYER_CARD_Z, LAYER_PICK_Z} from '../../utils/constants'

import {Experience} from '../Experience'

export class Card {
  experience
  scene
  gameState
  mouse
  root

  isPointerDown = false
  isPicked = false

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
        switch (this.gameState.step) {
        case 'select':
          this.animSelect()
          this.experience.board.cards.root.setEnabled(false)
          this.gameState.step = 'play'
          break
        case 'play':
          if (this.isPicked) {
            this.isPointerDown = true
          } else {
            this.animPick()
            this.isPicked = true
          }
          break
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

  animSelect() {
    this.root.setParent(this.experience.board.root)
    const bottomRightSlotPos = this.experience.board.bottomRightSlot.root.position
    this.root.position.set(bottomRightSlotPos.x, bottomRightSlotPos.y, LAYER_CARD_Z)
    this.root.rotation.set(0, Math.PI, 0)
  }

  animPick() {
    this.root.setParent(this.experience.board.root)
    this.root.position.set(0, -2.35, LAYER_PICK_Z)
    this.root.rotation.set(Math.PI * BOARD_ANGLE_FACTOR, Math.PI, 0)
    const scale = 1.3
    this.root.scaling.set(scale, scale, scale)
  }
}