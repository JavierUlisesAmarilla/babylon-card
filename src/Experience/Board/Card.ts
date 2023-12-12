import * as BABYLON from 'babylonjs'
import * as earcut from 'earcut'

import {BOARD_ANGLE_FACTOR, GAP, LAYER_CARD_Z, LAYER_PICK_Z, MAX_ANIM_FRAME_TO} from '../../utils/constants'
import {getLookQuat, getRandomTarget} from '../../utils/common'

import {Experience} from '../Experience'
import {addGhostlyGlowSpriteTo} from '../../utils/add-on'
import gsap from 'gsap'

export class Card {
  name
  experience
  root
  tweakTimeout
  backTitle
  backText!: BABYLON.Mesh
  frontTopTitle
  frontTopText!: BABYLON.Mesh
  frontBottomTitle
  frontBottomText!: BABYLON.Mesh
  isPointerDown = false
  prevPos = new BABYLON.Vector3()
  isAnimating = false
  lookQuat!: BABYLON.Quaternion | null
  tweakIntervalIndex!: number
  hoverScale = 1.1
  curStep = 'level' // level, side, bottom, lay

  constructor({
    name, // Should be unique
    width,
    height,
    position,
    frontTextureUrl,
    backTextureUrl,
    tweakTimeout = 1500,
    backTitle,
    frontTopTitle,
    frontBottomTitle,
  }: {
    name: string
    width: number
    height: number
    position: BABYLON.Vector3
    frontTextureUrl: string
    backTextureUrl: string
    tweakTimeout?: number
    backTitle?: string
    frontTopTitle?: string
    frontBottomTitle?: string
  }) {
    this.name = name
    this.experience = new Experience()
    this.root = new BABYLON.TransformNode(name)
    this.root.position.copyFrom(position)
    this.tweakTimeout = tweakTimeout
    this.backTitle = backTitle
    this.frontTopTitle = frontTopTitle
    this.frontBottomTitle = frontBottomTitle

    const front = BABYLON.MeshBuilder.CreatePlane(name, {width, height}, this.experience.scene)
    front.parent = this.root
    const frontMaterial = new BABYLON.StandardMaterial(name)
    frontMaterial.diffuseTexture = new BABYLON.Texture(frontTextureUrl)
    front.material = frontMaterial
    front.position.z = -GAP / 2

    const frontGlow = addGhostlyGlowSpriteTo(this.root, '#FF0000')
    frontGlow.setEnabled(true)
    frontGlow.applyTextureSizeToGeometry(frontGlow.baseTexture)
    frontGlow.visibility = 0.5
    frontGlow.rotation.y = Math.PI
    frontGlow.scaling.set(0.18 * width, 0.13 * height, 1)

    front.actionManager = new BABYLON.ActionManager(this.experience.scene)
    front.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPointerOverTrigger}, () => this.onPointerOver()))
    front.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPointerOutTrigger}, () => this.onPointerOut()))

    const back = BABYLON.MeshBuilder.CreatePlane(name, {width, height}, this.experience.scene)
    back.parent = this.root
    const backMaterial = new BABYLON.StandardMaterial(name)
    backMaterial.diffuseTexture = new BABYLON.Texture(backTextureUrl)
    back.material = backMaterial
    back.position.z = GAP / 2
    back.rotation.y = Math.PI

    const backGlow = addGhostlyGlowSpriteTo(this.root, '#00FF00')
    backGlow.setEnabled(true)
    backGlow.applyTextureSizeToGeometry(backGlow.baseTexture)
    backGlow.visibility = 0.5
    backGlow.scaling.set(0.18 * width, 0.13 * height, 1)

    this.tweak()
    this.reset()

    this.experience.drag.on('pointerDown', async (root: BABYLON.Mesh) => {
      if (root.name === name && !this.isAnimating) {
        this.isAnimating = true
        this.isPointerDown = true

        switch (this.curStep) {
        case 'level':
          await this.onSelectLevel()
          break
        case 'side':
          await this.onPickFromSide()
          break
        case 'bottom':
        case 'lay':
          this.prevPos.copyFrom(this.root.position)
          break
        }

        this.isAnimating = false
      }
    })

    this.experience.drag.on('pointerMove', (root: BABYLON.Mesh, diff: BABYLON.Vector3) => {
      if (root.name === name && this.isPointerDown && (this.curStep === 'bottom' || this.curStep === 'lay')) {
        this.root.position.addInPlace(diff)
      }
    })

    this.experience.drag.on('pointerUp', async () => {
      if (this.isPointerDown && !this.isAnimating) {
        this.isAnimating = true
        const pickedMesh = this.experience.slotPicker.getPickedMesh()

        if (pickedMesh) {
          await this.onDrop(pickedMesh)
        } else {
          await this.onPrev()
        }
      }

      this.isPointerDown = false
      this.isAnimating = false
    })
  }

  async reset() {
    const fontData = await (await fetch('https://assets.babylonjs.com/fonts/Droid Sans_Regular.json')).json()

    if (this.backTitle) {
      const backText = BABYLON.MeshBuilder.CreateText(this.name, this.backTitle, fontData, {size: 0.07, resolution: 64, depth: 0.01}, this.experience.scene, earcut)

      if (backText) {
        this.backText = backText
        backText.parent = this.root
        backText.position.y = -0.27
        backText.position.z = GAP
        backText.rotation.y = Math.PI
      }
    } else {
      if (this.backText) {
        this.backText.dispose()
      }
    }

    if (this.frontTopTitle) {
      const frontTopText = BABYLON.MeshBuilder.CreateText(this.name, this.frontTopTitle, fontData, {size: 0.07, resolution: 64, depth: 0.01}, this.experience.scene, earcut)

      if (frontTopText) {
        this.frontTopText = frontTopText
        frontTopText.parent = this.root
        frontTopText.position.y = 0.2
        frontTopText.position.z = -GAP
      }
    } else {
      if (this.frontTopText) {
        this.frontTopText.dispose()
      }
    }

    if (this.frontBottomTitle) {
      const frontBottomText = BABYLON.MeshBuilder.CreateText(this.name, this.frontBottomTitle, fontData, {size: 0.1, resolution: 64, depth: 0.01}, this.experience.scene, earcut)

      if (frontBottomText) {
        this.frontBottomText = frontBottomText
        frontBottomText.parent = this.root
        frontBottomText.position.y = -0.27
        frontBottomText.position.z = -GAP
      }
    } else {
      if (this.frontBottomText) {
        this.frontBottomText.dispose()
      }
    }
  }

  async onSelectLevel() {
    this.clearTweak()
    this.experience.board.cards.root.setEnabled(false)
    this.root.setParent(this.experience.board.root)

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

    await this.experience.scene.beginDirectAnimation(this.root, [animPos], 0, MAX_ANIM_FRAME_TO, false).waitAsync()

    this.backText.dispose()
    this.curStep = 'side'
  }

  async onPickFromSide() {
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

    await this.experience.scene.beginDirectAnimation(this.root, [animPos], 0, MAX_ANIM_FRAME_TO, false).waitAsync()

    this.curStep = 'bottom'
  }

  async onDrop(pickedMesh: BABYLON.AbstractMesh) {
    const animPos = new BABYLON.Animation('animPos', 'position', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animPos.setKeys([
      {
        frame: 0,
        value: this.root.position
      },
      {
        frame: 5,
        value: new BABYLON.Vector3(pickedMesh.position.x, pickedMesh.position.y, LAYER_CARD_Z)
      },
    ])

    const lookTarget = this.root.position.clone()
    lookTarget.z += 1
    this.lookQuat = getLookQuat(this.root.position, lookTarget)

    await this.experience.scene.beginDirectAnimation(this.root, [animPos], 0, MAX_ANIM_FRAME_TO, false).waitAsync()

    this.curStep = 'lay'
  }

  async onPrev() {
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

    await this.experience.scene.beginDirectAnimation(this.root, [animPos], 0, MAX_ANIM_FRAME_TO, false).waitAsync()
  }

  onPointerOver() {
    if (this.curStep === 'level' || this.curStep === 'bottom') {
      gsap.timeline().to(this.root.scaling, {x: this.hoverScale, y: this.hoverScale, z: this.hoverScale, duration: 0.2})
    }
  }

  onPointerOut() {
    gsap.timeline().to(this.root.scaling, {x: 1, y: 1, z: 1, duration: 0.2})
  }

  getRandomLookQuat() {
    const lookTarget = getRandomTarget(this.root.position, -1, 0.2)
    return getLookQuat(this.root.position, lookTarget)
  }

  tweak() {
    this.root.rotationQuaternion = this.getRandomLookQuat()
    this.tweakIntervalIndex = setInterval(() => {
      this.lookQuat = this.getRandomLookQuat()
    }, this.tweakTimeout)
  }

  clearTweak() {
    clearInterval(this.tweakIntervalIndex)
    this.lookQuat = null
  }

  update() {
    if (this.lookQuat && this.root.rotationQuaternion) {
      this.root.rotationQuaternion = BABYLON.Quaternion.Slerp(this.root.rotationQuaternion, this.lookQuat, 0.15)
    }
  }
}