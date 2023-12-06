import * as BABYLON from 'babylonjs'

import {BOARD_ANGLE_FACTOR, GAP, LAYER_CARD_Z, LAYER_PICK_Z, MAX_ANIM_FRAME_TO} from '../../utils/constants'
import {getLookQuat, getRandomTarget} from '../../utils/common'

import {Experience} from '../Experience'

export class Card {
  name
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
  isAnimating = false
  lookQuat!: BABYLON.Quaternion | null
  tweakTimeout = 1500
  tweakIntervalNum!: number
  hoverScale = 1.2

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
    this.name = name
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
          this.root.setParent(this.experience.board.root)
          await this.animSelect()
          this.gameState.step = 'play'
          break
        case 'play':
          if (this.isPicked) {
            this.prevPos.copyFrom(this.root.position)
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
    const bottomRightSlotPos = this.experience.board.bottomRightSlot.root.position
    const animPos = new BABYLON.Animation(this.name, 'position', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
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

    const lookTarget = this.root.position.clone()
    lookTarget.z -= 1
    this.lookQuat = getLookQuat(this.root.position, lookTarget)

    await this.scene.beginDirectAnimation(this.root, [animPos], 0, MAX_ANIM_FRAME_TO, false).waitAsync()
  }

  async animPick() {
    const animPos = new BABYLON.Animation(this.name, 'position', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animPos.setKeys([
      {
        frame: 0,
        value: this.root.position
      },
      {
        frame: 10,
        value: new BABYLON.Vector3(0, -2.1, LAYER_PICK_Z)
      },
    ])

    const lookTarget = this.root.position.clone()
    lookTarget.y += 10 * BOARD_ANGLE_FACTOR * 2
    lookTarget.z += 10
    this.lookQuat = getLookQuat(this.root.position, lookTarget)

    await this.scene.beginDirectAnimation(this.root, [animPos], 0, MAX_ANIM_FRAME_TO, false).waitAsync()
  }

  async animDrop(pickedMesh: BABYLON.AbstractMesh) {
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

    const lookTarget = this.root.position.clone()
    lookTarget.z += 1
    this.lookQuat = getLookQuat(this.root.position, lookTarget)

    await this.scene.beginDirectAnimation(this.root, [animPos], 0, MAX_ANIM_FRAME_TO, false).waitAsync()
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

    await this.scene.beginDirectAnimation(this.root, [animPos], 0, MAX_ANIM_FRAME_TO, false).waitAsync()
  }

  getRandomLookQuat() {
    const lookTarget = getRandomTarget(this.root.position, -1, 0.6)
    return getLookQuat(this.root.position, lookTarget)
  }

  tweak() {
    this.root.rotationQuaternion = this.getRandomLookQuat()
    this.tweakIntervalNum = setInterval(() => {
      this.lookQuat = this.getRandomLookQuat()
    }, this.tweakTimeout)
  }

  clearTweak() {
    clearInterval(this.tweakIntervalNum)
    this.lookQuat = null
  }

  update() {
    if (this.lookQuat && this.root.rotationQuaternion) {
      this.root.rotationQuaternion = BABYLON.Quaternion.Slerp(this.root.rotationQuaternion, this.lookQuat, 0.2)
    }

    // Hover
    const pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY)

    if (pickInfo?.pickedMesh?.name === this.name) {
      if (this.gameState.step === 'select') {
        const lerpScale = BABYLON.Vector3.Lerp(this.root.scaling, new BABYLON.Vector3(this.hoverScale, this.hoverScale, this.hoverScale), 0.05)
        this.root.scaling.copyFrom(lerpScale)
      }
    } else {
      const lerpScale = BABYLON.Vector3.Lerp(this.root.scaling, new BABYLON.Vector3(1, 1, 1), 0.05)
      this.root.scaling.copyFrom(lerpScale)
    }
  }
}