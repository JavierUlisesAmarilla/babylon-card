import * as BABYLON from 'babylonjs'
import * as earcut from 'earcut'

import {BOARD_ANGLE_FACTOR, GAP, LAYER_CARD_Z, LAYER_PICK_Z} from '../../utils/constants'
import {addGhostlyGlowSpriteTo, createPlane3D} from '../../utils/add-on'
import {delay, getLookQuat, getRandomTarget} from '../../utils/common'

import {AnimatedSprite} from '../../utils/animated-sprite'
import {Experience} from '../Experience'
import {dustCool} from '../../utils/sprite-animations'
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
  frontGlow
  frontBorderGlow
  hoverGlow

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

    // Border
    const border = BABYLON.MeshBuilder.CreatePlane(name, {width, height, sideOrientation: 2}, this.experience.scene)
    border.parent = this.root
    const borderMaterial = new BABYLON.StandardMaterial(name)
    borderMaterial.diffuseTexture = new BABYLON.Texture('assets/images/border.png')
    border.material = borderMaterial
    border.scaling.set(2.8 * width, 1.6 * height, 1)

    // Front
    const front = BABYLON.MeshBuilder.CreatePlane(name, {width, height}, this.experience.scene)
    front.parent = this.root
    const frontMaterial = new BABYLON.StandardMaterial(name)
    frontMaterial.diffuseTexture = new BABYLON.Texture(frontTextureUrl)
    front.material = frontMaterial
    front.position.z = -GAP / 2

    this.frontGlow = addGhostlyGlowSpriteTo(this.root, '#FFD700')
    this.frontGlow.setEnabled(true)
    this.frontGlow.applyTextureSizeToGeometry(this.frontGlow.baseTexture)
    this.frontGlow.visibility = 1
    this.frontGlow.intensity = 10
    this.frontGlow.scaling.set(0.18 * width, 0.135 * height, 1)

    this.frontBorderGlow = addGhostlyGlowSpriteTo(this.root, '#FFD700')
    this.frontBorderGlow.setEnabled(true)
    this.frontBorderGlow.applyTextureSizeToGeometry(this.frontBorderGlow.baseTexture)
    this.frontBorderGlow.visibility = 0
    this.frontBorderGlow.intensity = 20
    this.frontBorderGlow.scaling.set(0.18 * width, 0.135 * height, 1)

    front.actionManager = new BABYLON.ActionManager(this.experience.scene)
    front.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPointerOverTrigger}, () => this.onPointerOver()))
    front.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPointerOutTrigger}, () => this.onPointerOut()))

    // Back
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
    backGlow.visibility = 1
    backGlow.intensity = 10
    backGlow.rotation.y = Math.PI
    backGlow.scaling.set(0.18 * width, 0.135 * height, 1)

    // Hover glow
    this.hoverGlow = createPlane3D('assets/images/plasma/glow3.webp', {name, parent: this.root})
    this.hoverGlow.position.z = GAP
    this.hoverGlow.rotation.y = Math.PI
    this.hoverGlow.scaling.set(0.18 * width, 0.135 * height, 1)
    this.hoverGlow.setTintColor(new BABYLON.Color3(0.1, 0.4, 0.9))
    this.hoverGlow.setAdditiveBlendMode()
    this.hoverGlow.visibility = 0

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
          const prefixName = pickedMesh.name.substring(0, 6)

          if (prefixName === 'b-slot') {
            await this.onDrop(pickedMesh)
          }

          if (prefixName === 't-slot') {
            await this.onAttack(pickedMesh)
          }
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
      const backText = BABYLON.MeshBuilder.CreateText(this.name, this.backTitle, fontData, {size: 0.07, resolution: 64, depth: 0.01, faceColors: [new BABYLON.Color4(0, 1, 0, 1)]}, this.experience.scene, earcut)

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
      const frontTopText = BABYLON.MeshBuilder.CreateText(this.name, this.frontTopTitle, fontData, {size: 0.07, resolution: 64, depth: 0.01, faceColors: [new BABYLON.Color4(1, 1, 0, 1)]}, this.experience.scene, earcut)

      if (frontTopText) {
        this.frontTopText = frontTopText
        frontTopText.parent = this.root
        frontTopText.position.y = 0.2
        frontTopText.position.z = -GAP
        frontTopText.visibility = 0
      }
    } else {
      if (this.frontTopText) {
        this.frontTopText.dispose()
      }
    }

    if (this.frontBottomTitle) {
      const frontBottomText = BABYLON.MeshBuilder.CreateText(this.name, this.frontBottomTitle, fontData, {size: 0.1, resolution: 64, depth: 0.01, faceColors: [new BABYLON.Color4(1, 1, 0, 1)]}, this.experience.scene, earcut)

      if (frontBottomText) {
        this.frontBottomText = frontBottomText
        frontBottomText.parent = this.root
        frontBottomText.position.y = -0.27
        frontBottomText.position.z = -GAP
        frontBottomText.visibility = 0
      }
    } else {
      if (this.frontBottomText) {
        this.frontBottomText.dispose()
      }
    }
  }

  async onSelectLevel() {
    this.clearTweak()

    this.root.setParent(this.experience.board.root)
    this.experience.board.cards.root.setEnabled(false)

    const zoomInTarget = [0, -3, -2]
    const lookTarget = this.root.position.clone()
    lookTarget.z -= 1
    const lookQuat = getLookQuat(this.root.position, lookTarget)
    const bottomRightSlotPos = this.experience.board.bottomRightSlot.root.position
    const duration = 0.5
    const ease = 'circ.inOut'
    await gsap.timeline()
      .to(this.root.position, {x: zoomInTarget[0], y: zoomInTarget[1], z: zoomInTarget[2], duration, ease})
      .to(this.root.rotationQuaternion, {x: lookQuat.x, y: lookQuat.y, z: lookQuat.z, w: lookQuat.w, duration, ease}, 0)

    const fx = AnimatedSprite.fromAtlasJsonURL('https://undroop-assets.web.app/confucius/rtfx-pngquant/fx/simple-energy-086-charge--radial--norsz.json', 30, 100, this.experience.scene)
    fx.isPickable = false
    fx.renderingGroupId = 1
    fx.position.z = 0
    fx.rotation.y = Math.PI
    fx.scaling.setAll(0.3)
    fx.parent = this.root
    if (fx.material) fx.material.alphaMode = BABYLON.Engine.ALPHA_ADD
    fx.color = BABYLON.Color3.FromHexString('#209f0f0')
    fx.playAndDispose()
    await delay(duration)

    await gsap.timeline()
      .to(this.hoverGlow, {visibility: 0, duration, ease})
      .to(this.root.position, {x: bottomRightSlotPos.x, y: bottomRightSlotPos.y, z: LAYER_CARD_Z, duration, ease}, 0)
      .to(this.backText, {visibility: 0, duration, ease}, 0)
      .to(this.root.scaling, {x: 1, y: 1, z: 1, duration, ease}, 0)

    this.backText.dispose()
    this.curStep = 'side'
  }

  async onPickFromSide() {
    const lookTarget = this.root.position.clone()
    lookTarget.y += 10 * BOARD_ANGLE_FACTOR * 2
    lookTarget.z += 10
    const lookQuat = getLookQuat(this.root.position, lookTarget)
    const duration = 0.15
    const ease = 'circ.inOut'
    await gsap.timeline()
      .to(this.root.position, {z: LAYER_PICK_Z, duration, ease})
      .to(this.root.position, {x: 0, y: -2.3, z: LAYER_PICK_Z, duration, ease}, duration)
      .to(this.root.rotationQuaternion, {x: lookQuat.x, y: lookQuat.y, z: lookQuat.z, w: lookQuat.w, duration, ease}, duration)
      .to(this.frontTopText, {visibility: 1, duration: 0.5, ease}, 2 * duration)
      .to(this.frontBottomText, {visibility: 1, duration: 0.5, ease}, 2 * duration)

    this.curStep = 'bottom'
  }

  async onDrop(pickedMesh: BABYLON.AbstractMesh) {
    const dust = dustCool(this.experience.scene)
    dust.parent = this.root
    dust.scaling.setAll(0.1)
    dust.visibility = 0.05
    dust.parent = this.root

    const lookTarget = this.root.position.clone()
    lookTarget.z += 1
    const lookQuat = getLookQuat(this.root.position, lookTarget)
    const duration = 0.5
    const ease = 'circ.inOut'
    await gsap.timeline()
      .to(this.root.position, {x: this.prevPos.x, y: this.prevPos.y, z: this.prevPos.z, duration: 0})
      .to(this.root.position, {x: pickedMesh.position.x, y: pickedMesh.position.y, z: LAYER_PICK_Z, duration, ease})
      .to(this.frontGlow, {visibility: 0, duration, ease}, 0)
      .to(this.frontBorderGlow, {visibility: 0, duration, ease}, 0)
      .to(this.root.rotationQuaternion, {x: lookQuat.x, y: lookQuat.y, z: lookQuat.z, w: lookQuat.w, duration: 0.5, ease}, 0)
      .to(this.root.position, {z: LAYER_CARD_Z, duration: 0.1 * duration, ease}, duration)

    dust.playAndDispose()

    this.curStep = 'lay'
  }

  async onPrev() {
    const duration = 0.2
    await gsap.timeline().to(this.root.position, {x: this.prevPos.x, y: this.prevPos.y, z: this.prevPos.z, duration, ease: 'power1.inOut'})
  }

  async onPointerOver() {
    if (this.curStep === 'level' || this.curStep === 'bottom') {
      await gsap.timeline()
        .to(this.hoverGlow, {visibility: 0.3, duration: 0.1})
        .to(this.root.scaling, {x: this.hoverScale, y: this.hoverScale, z: this.hoverScale, duration: 0.2}, 0)
        .to(this.frontBorderGlow, {visibility: 1, duration: 0.2}, 0)
    }
  }

  async onPointerOut() {
    await gsap.timeline()
      .to(this.root.scaling, {x: 1, y: 1, z: 1, duration: 0.2})
      .to(this.frontBorderGlow, {visibility: 0, duration: 0.2}, 0)
      .to(this.hoverGlow, {visibility: 0, duration: 0.2}, 0)
  }

  async onAttack(pickedMesh: BABYLON.AbstractMesh) {
    await this.onPrev()
    const {x, y, z} = pickedMesh.position
    const duration = 0.1
    const ease = 'power1.inOut'
    await gsap.timeline()
      .to(this.root.position, {x, y, z: z - GAP, duration, ease})
      .to(this.root.position, {x: this.prevPos.x, y: this.prevPos.y, z: this.prevPos.z, duration, ease})
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