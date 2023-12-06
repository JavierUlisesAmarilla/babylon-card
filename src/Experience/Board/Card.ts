import * as BABYLON from 'babylonjs'

import {BOARD_ANGLE_FACTOR, GAP, LAYER_CARD_Z, LAYER_PICK_Z, MAX_ANIM_FRAME_TO} from '../../utils/constants'

import {Experience} from '../Experience'
import {getRandomTarget} from '../../utils/common'

export class Card {
  experience
  slotPicker
  scene
  gameState
  drag
  highlight
  root

  isPointerDown = false
  isPicked = false
  prevPos = new BABYLON.Vector3()
  prevRot = new BABYLON.Vector3()
  isAnimating = false
  tweakTargetQuat!: BABYLON.Quaternion | null
  tweakTimeout = 1500
  tweakIntervalNum!: number

  constructor({
    name, // Should be unique
    width,
    height,
    position,
    frontTextureUrl,
    backTextureUrl
  }: {
    name: string
    width: number
    height: number
    position: BABYLON.Vector3
    frontTextureUrl: string
    backTextureUrl: string
  }) {
    this.experience = new Experience()
    this.slotPicker = this.experience.slotPicker
    this.scene = this.experience.scene
    this.gameState = this.experience.gameState
    this.drag = this.experience.drag
    this.highlight = this.experience.highlight
    this.root = new BABYLON.TransformNode(name)
    this.root.position.copyFrom(position)

    const front = BABYLON.MeshBuilder.CreatePlane(name, {width, height}, this.scene)
    front.parent = this.root
    const frontMaterial = new BABYLON.StandardMaterial(name)
    frontMaterial.diffuseTexture = new BABYLON.Texture(frontTextureUrl)
    front.material = frontMaterial
    front.position.z = -GAP / 2

    const back = BABYLON.MeshBuilder.CreatePlane(name, {width, height}, this.scene)
    back.parent = this.root
    const backMaterial = new BABYLON.StandardMaterial(name)
    backMaterial.diffuseTexture = new BABYLON.Texture(backTextureUrl)
    back.material = backMaterial
    back.position.z = GAP / 2
    back.rotation.y = Math.PI

    this.highlight.addMeshes([front, back], BABYLON.Color3.Teal())
    this.tweak()

    this.drag.on('pointerDown', async (root: BABYLON.Mesh) => {
      if (root.name === name && !this.isAnimating) {
        this.isAnimating = true

        switch (this.gameState.step) {
        case 'select':
          this.clearTweak()
          this.experience.board.cards.root.setEnabled(false)
          await this.animSelect()
          this.gameState.step = 'play'
          break
        case 'play':
          if (this.isPicked) {
            this.prevPos.copyFrom(this.root.position)
            this.prevRot.copyFrom(this.root.rotation)
            this.isPointerDown = true
          } else {
            await this.animPick()
            this.isPicked = true
          }
          break
        }

        this.isAnimating = false
      }
    })

    this.drag.on('pointerMove', (root: BABYLON.Mesh, diff: BABYLON.Vector3) => {
      if (root.name === name && this.isPointerDown && this.gameState.step === 'play') {
        this.root.position.addInPlace(diff)
      }
    })

    this.drag.on('pointerUp', async () => {
      if (this.isPointerDown && !this.isAnimating) {
        this.isAnimating = true
        const pickedMesh = this.slotPicker.getPickedMesh()

        if (pickedMesh) {
          await this.animDrop(pickedMesh)
        } else {
          await this.animToPrev()
        }
      }

      this.isPointerDown = false
      this.isAnimating = false
    })
  }

  async animSelect() {
    this.root.setParent(this.experience.board.root)
    const bottomRightSlotPos = this.experience.board.bottomRightSlot.root.position

    const animPos = new BABYLON.Animation('animPos', 'position', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animPos.setKeys([
      {
        frame: 0,
        value: this.root.position
      },
      {
        frame: 10,
        value: new BABYLON.Vector3(0, -2.2, -3)
      },
      {
        frame: 20,
        value: new BABYLON.Vector3(0, -2.2, -3)
      },
      {
        frame: 40,
        value: new BABYLON.Vector3(bottomRightSlotPos.x, bottomRightSlotPos.y, LAYER_CARD_Z)
      },
    ])

    const animRot = new BABYLON.Animation('animRot', 'rotation', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animRot.setKeys([
      {
        frame: 0,
        value: this.root.rotation
      },
      {
        frame: 10,
        value: new BABYLON.Vector3(0, Math.PI, 0)
      },
    ])

    await this.scene.beginDirectAnimation(this.root, [animPos, animRot], 0, MAX_ANIM_FRAME_TO, false).waitAsync()
  }

  async animPick() {
    this.root.setParent(this.experience.board.root)
    const scale = 1.3

    const animPos = new BABYLON.Animation('animPos', 'position', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animPos.setKeys([
      {
        frame: 0,
        value: this.root.position
      },
      {
        frame: 10,
        value: new BABYLON.Vector3(0, -1.55, LAYER_PICK_Z)
      },
    ])

    const animRot = new BABYLON.Animation('animRot', 'rotation', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animRot.setKeys([
      {
        frame: 0,
        value: this.root.rotation
      },
      {
        frame: 10,
        value: new BABYLON.Vector3(-Math.PI * BOARD_ANGLE_FACTOR, 0, 0)
      },
    ])

    const animScale = new BABYLON.Animation('animScale', 'scaling', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animScale.setKeys([
      {
        frame: 0,
        value: this.root.scaling
      },
      {
        frame: 10,
        value: new BABYLON.Vector3(scale, scale, scale)
      },
    ])

    await this.scene.beginDirectAnimation(this.root, [animPos, animRot, animScale], 0, MAX_ANIM_FRAME_TO, false).waitAsync()
  }

  async animDrop(pickedMesh: BABYLON.AbstractMesh) {
    this.root.setParent(this.experience.board.root)
    const scale = 1

    const animPos = new BABYLON.Animation('animPos', 'position', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animPos.setKeys([
      {
        frame: 0,
        value: this.root.position
      },
      {
        frame: 10,
        value: new BABYLON.Vector3(pickedMesh.position.x, pickedMesh.position.y, LAYER_CARD_Z)
      },
    ])

    const animRot = new BABYLON.Animation('animRot', 'rotation', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animRot.setKeys([
      {
        frame: 0,
        value: this.root.rotation
      },
      {
        frame: 10,
        value: pickedMesh.rotation
      },
    ])

    const animScale = new BABYLON.Animation('animScale', 'scaling', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animScale.setKeys([
      {
        frame: 0,
        value: this.root.scaling
      },
      {
        frame: 10,
        value: new BABYLON.Vector3(scale, scale, scale)
      },
    ])

    await this.scene.beginDirectAnimation(this.root, [animPos, animRot, animScale], 0, MAX_ANIM_FRAME_TO, false).waitAsync()
  }

  async animToPrev() {
    const animPos = new BABYLON.Animation('animPos', 'position', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animPos.setKeys([
      {
        frame: 0,
        value: this.root.position
      },
      {
        frame: 10,
        value: this.prevPos
      },
    ])

    const animRot = new BABYLON.Animation('animRot', 'rotation', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animRot.setKeys([
      {
        frame: 0,
        value: this.root.rotation
      },
      {
        frame: 10,
        value: this.prevRot
      },
    ])

    await this.scene.beginDirectAnimation(this.root, [animPos, animRot], 0, MAX_ANIM_FRAME_TO, false).waitAsync()
  }

  getRandomTargetQuat() {
    const target = getRandomTarget(this.root.position, -1, 0.6)
    const lookAt = BABYLON.Matrix.LookAtLH(this.root.position, target, BABYLON.Vector3.Up()).invert()
    return BABYLON.Quaternion.FromRotationMatrix(lookAt)
  }

  tweak() {
    this.root.rotationQuaternion = this.getRandomTargetQuat()
    this.tweakIntervalNum = setInterval(() => {
      this.tweakTargetQuat = this.getRandomTargetQuat()
    }, this.tweakTimeout)
  }

  clearTweak() {
    clearInterval(this.tweakIntervalNum)
    this.tweakTargetQuat = null
  }

  update() {
    if (this.tweakTargetQuat && this.root.rotationQuaternion) {
      this.root.rotationQuaternion = BABYLON.Quaternion.Slerp(this.root.rotationQuaternion, this.tweakTargetQuat, 0.1)
    }
  }
}