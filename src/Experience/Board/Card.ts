import * as BABYLON from 'babylonjs'
import * as earcut from 'earcut'

import {BOARD_ANGLE_FACTOR, GAP, LAYER_CARD_Z, LAYER_PICK_Z, TEXT_DEPTH} from '../../utils/constants'
import {addGhostlyGlowSpriteTo, createPlane3D} from '../../utils/add-on'
import {delay, getLookQuat, getRandomTarget} from '../../utils/common'
import {dustCool, explodeCombat, lightCrawl} from '../../utils/sprite-animations'

import {AnimatedSprite} from '../../utils/animated-sprite'
import {Experience} from '../Experience'
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
  frontHoverText!: BABYLON.Mesh
  frontHoverTextBack!: BABYLON.Mesh
  isPointerDown = false
  prevPos = new BABYLON.Vector3()
  pickPrevPos = new BABYLON.Vector3()
  isAnimating = false
  lookQuat!: BABYLON.Quaternion | null
  prevLookQuat = new BABYLON.Quaternion()
  tweakIntervalIndex!: number
  hoverScale = 1.1
  curStep = 'level' // level, side, bottom, lay
  frontGlow
  frontBorderGlow
  frontHoverGlow
  backHoverGlow
  slotName!: string
  isShowInfo = false
  isPick = false

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

    this.frontHoverGlow = createPlane3D('assets/images/plasma/glow3.webp', {name, parent: this.root})
    this.frontHoverGlow.position.z = -GAP
    this.frontHoverGlow.scaling.set(0.18 * width, 0.135 * height, 1)
    this.frontHoverGlow.setTintColor(new BABYLON.Color3(0.1, 0.4, 0.9))
    this.frontHoverGlow.setAdditiveBlendMode()
    this.frontHoverGlow.visibility = 0

    this.frontHoverTextBack = BABYLON.MeshBuilder.CreatePlane(name, {width: 0.8 * width, height: 0.3 * height}, this.experience.scene)
    this.frontHoverTextBack.parent = this.root
    const frontHoverTextBackMaterial = new BABYLON.StandardMaterial(name)
    frontHoverTextBackMaterial.diffuseTexture = new BABYLON.Texture('assets/images/border.png')
    this.frontHoverTextBack.material = frontHoverTextBackMaterial
    this.frontHoverTextBack.position.z = -GAP
    this.frontHoverTextBack.visibility = 0
    this.frontHoverTextBack.isPickable = false

    front.actionManager = new BABYLON.ActionManager(this.experience.scene)
    front.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPointerOverTrigger}, () => this.onPointerOver()))
    front.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPointerOutTrigger}, () => this.onPointerOut()))
    front.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPickTrigger}, () => this.onPick()))
    front.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPickDownTrigger}, () => this.onPickDown()))
    front.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPickUpTrigger}, () => this.onPickUp()))

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

    this.backHoverGlow = createPlane3D('assets/images/plasma/glow3.webp', {name, parent: this.root})
    this.backHoverGlow.position.z = GAP
    this.backHoverGlow.rotation.y = Math.PI
    this.backHoverGlow.scaling.set(0.18 * width, 0.135 * height, 1)
    this.backHoverGlow.setTintColor(new BABYLON.Color3(0.1, 0.4, 0.9))
    this.backHoverGlow.setAdditiveBlendMode()
    this.backHoverGlow.visibility = 0

    back.actionManager = new BABYLON.ActionManager(this.experience.scene)
    back.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPointerOverTrigger}, () => this.onPointerOver()))
    back.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPointerOutTrigger}, () => this.onPointerOut()))
    back.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPickTrigger}, () => this.onPick()))
    back.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPickDownTrigger}, () => this.onPickDown()))
    back.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPickUpTrigger}, () => this.onPickUp()))

    this.tweak()
    this.reset()

    this.experience.drag.on('pointerMove', (root: BABYLON.Mesh, diff: BABYLON.Vector3) => {
      if (root.name === name && this.isPointerDown && (this.curStep === 'bottom' || this.curStep === 'lay')) {
        this.root.position.addInPlace(diff)
      }
    })
  }

  async reset() {
    const fontData = await (await fetch('https://assets.babylonjs.com/fonts/Droid Sans_Regular.json')).json()

    // Back text
    if (this.backText) {
      this.backText.dispose()
    }

    if (this.backTitle) {
      const backText = BABYLON.MeshBuilder.CreateText(this.name, this.backTitle, fontData, {size: 0.07, resolution: 64, depth: TEXT_DEPTH, faceColors: [new BABYLON.Color4(0, 1, 0, 1)]}, this.experience.scene, earcut)

      if (backText) {
        this.backText = backText
        backText.parent = this.root
        backText.position.y = -0.27
        backText.position.z = GAP
        backText.rotation.y = Math.PI
      }
    }

    // Front top text
    if (this.frontTopText) {
      this.frontTopText.dispose()
    }

    if (this.frontTopTitle) {
      const frontTopText = BABYLON.MeshBuilder.CreateText(this.name, this.frontTopTitle, fontData, {size: 0.07, resolution: 64, depth: TEXT_DEPTH, faceColors: [new BABYLON.Color4(1, 1, 0, 1)]}, this.experience.scene, earcut)

      if (frontTopText) {
        this.frontTopText = frontTopText
        frontTopText.parent = this.root
        frontTopText.position.y = 0.2
        frontTopText.position.z = -GAP
        frontTopText.visibility = 0
      }
    }

    // Front bottom text
    if (this.frontBottomText) {
      this.frontBottomText.dispose()
    }

    if (this.frontBottomTitle) {
      const frontBottomText = BABYLON.MeshBuilder.CreateText(this.name, this.frontBottomTitle, fontData, {size: 0.1, resolution: 64, depth: TEXT_DEPTH, faceColors: [new BABYLON.Color4(1, 1, 0, 1)]}, this.experience.scene, earcut)

      if (frontBottomText) {
        this.frontBottomText = frontBottomText
        frontBottomText.parent = this.root
        frontBottomText.position.y = -0.27
        frontBottomText.position.z = -GAP
        frontBottomText.visibility = 0
      }
    }

    // Front hover text
    if (this.frontHoverText) {
      this.frontHoverText.dispose()
    }

    if (this.frontBottomTitle) {
      const frontHoverText = BABYLON.MeshBuilder.CreateText(this.name, 'Hover', fontData, {size: 0.05, resolution: 64, depth: TEXT_DEPTH}, this.experience.scene, earcut)

      if (frontHoverText) {
        this.frontHoverText = frontHoverText
        frontHoverText.parent = this.frontHoverTextBack
        frontHoverText.position.y = 0
        frontHoverText.position.z = -GAP
        frontHoverText.visibility = 0
      }
    }
  }

  async animSelectLevel() {
    this.clearTweak()

    this.root.setParent(this.experience.board.root)
    this.experience.board.cards.root.setEnabled(false)

    const zoomInTarget = [0, -3, -2]
    const lookTarget = this.root.position.clone()
    lookTarget.z -= 1
    const lookQuat = getLookQuat(this.root.position, lookTarget)
    this.prevLookQuat.copyFrom(lookQuat)
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
      .to(this.backHoverGlow, {visibility: 0, duration, ease})
      .to(this.root.position, {x: bottomRightSlotPos.x, y: bottomRightSlotPos.y, z: LAYER_CARD_Z, duration, ease}, 0)
      .to(this.backText, {visibility: 0, duration, ease}, 0)
      .to(this.root.scaling, {x: 1, y: 1, z: 1, duration, ease}, 0)

    this.backText.dispose()
    this.curStep = 'side'
  }

  async animPickFromSide() {
    const lookTarget = this.root.position.clone()
    lookTarget.y += 10 * BOARD_ANGLE_FACTOR * 2
    lookTarget.z += 10
    const lookQuat = getLookQuat(this.root.position, lookTarget)
    this.prevLookQuat.copyFrom(lookQuat)
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

  async animDrop(pickedMesh: BABYLON.AbstractMesh) {
    if (this.slotName === pickedMesh.name) {
      return
    }

    this.slotName = pickedMesh.name
    const dustCoolFx = dustCool(this.experience.scene)
    dustCoolFx.parent = this.root

    const lookTarget = this.root.position.clone()
    lookTarget.z += 1
    const lookQuat = getLookQuat(this.root.position, lookTarget)
    this.prevLookQuat.copyFrom(lookQuat)
    const duration = 0.5
    const ease = 'circ.inOut'
    await gsap.timeline()
      .to(this.root.position, {x: this.prevPos.x, y: this.prevPos.y, z: this.prevPos.z, duration: 0})
      .to(this.root.position, {x: pickedMesh.position.x, y: pickedMesh.position.y, z: LAYER_PICK_Z, duration, ease})
      .to(this.frontGlow, {visibility: 0, duration, ease}, 0)
      .to(this.frontBorderGlow, {visibility: 0, duration, ease}, 0)
      .to(this.root.rotationQuaternion, {x: lookQuat.x, y: lookQuat.y, z: lookQuat.z, w: lookQuat.w, duration: 0.5, ease}, 0)
      .to(this.root.position, {z: LAYER_CARD_Z, duration: 0.1 * duration, ease}, duration)
      .to(this.frontHoverGlow, {visibility: 1, duration: 0.3 * duration, ease}, duration)
      .to(this.frontHoverGlow, {visibility: 0, duration: 0.3 * duration, ease})

    dustCoolFx.playAndDispose()

    this.curStep = 'lay'
  }

  async animPrev() {
    const duration = 0.2
    await gsap.timeline().to(this.root.position, {x: this.prevPos.x, y: this.prevPos.y, z: this.prevPos.z, duration, ease: 'power1.inOut'})
  }

  async animAttack(pickedMesh: BABYLON.AbstractMesh) {
    await this.animPrev()
    const {x, y, z} = pickedMesh.position
    const duration = 0.1
    const ease = 'power1.inOut'

    await gsap.timeline().to(this.root.position, {x, y, z: z - GAP, duration, ease})

    const explodeCombatFx = explodeCombat(this.experience.scene)
    await explodeCombatFx.waitUntilLoaded()
    explodeCombatFx.parent = pickedMesh
    explodeCombatFx.playAndDispose()

    await gsap.to(this.root.position, {x: this.prevPos.x, y: this.prevPos.y, z: this.prevPos.z, duration, ease})
  }

  async animToggleShowInfo() {
    const duration = 0.2
    const ease = 'power1.inOut'

    if (this.isShowInfo) {
      await gsap.timeline()
        .to(this.root.position, {x: this.pickPrevPos.x, y: this.pickPrevPos.y, z: this.pickPrevPos.z, duration, ease})
        .to(this.root.rotationQuaternion, {x: this.prevLookQuat.x, y: this.prevLookQuat.y, z: this.prevLookQuat.z, w: this.prevLookQuat.w, duration, ease}, 0)
    } else {
      this.pickPrevPos.copyFrom(this.root.position)
      const targetPos = new BABYLON.Vector3(0.3, -3, -2)
      const lookQuat = getLookQuat(targetPos, new BABYLON.Vector3(0, 0, 0))
      await gsap.timeline()
        .to(this.root.position, {x: targetPos.x, y: targetPos.y, z: targetPos.z, duration, ease})
        .to(this.root.rotationQuaternion, {x: lookQuat.x, y: lookQuat.y, z: lookQuat.z, w: lookQuat.w, duration, ease}, 0)
      const lightCrawlFx = lightCrawl(this.experience.scene)
      await lightCrawlFx.waitUntilLoaded()
      lightCrawlFx.parent = this.root
      lightCrawlFx.playAndDispose()
    }

    this.isShowInfo = !this.isShowInfo
  }

  async onPointerOver() {
    switch (this.curStep) {
    case 'level':
    case 'bottom':
      await gsap.timeline()
        .to(this.backHoverGlow, {visibility: 0.3, duration: 0.1})
        .to(this.frontBorderGlow, {visibility: 1, duration: 0.2}, 0)
        .to(this.root.scaling, {x: this.hoverScale, y: this.hoverScale, z: this.hoverScale, duration: 0.2}, 0)
      break
    case 'lay':
      await gsap.timeline()
        .to(this.frontHoverTextBack, {visibility: 1, duration: 0.2})
        .to(this.frontHoverText, {visibility: 1, duration: 0.2}, 0)
      break
    }
  }

  async onPointerOut() {
    switch (this.curStep) {
    case 'level':
    case 'bottom':
      await gsap.timeline()
        .to(this.backHoverGlow, {visibility: 0, duration: 0.1})
        .to(this.frontBorderGlow, {visibility: 0, duration: 0.2}, 0)
        .to(this.root.scaling, {x: 1, y: 1, z: 1, duration: 0.2}, 0)
      break
    case 'lay':
      await gsap.timeline()
        .to(this.frontHoverTextBack, {visibility: 0, duration: 0.2})
        .to(this.frontHoverText, {visibility: 0, duration: 0.2}, 0)
      break
    }
  }

  async onPick() {
    console.log('Card#onPick')
    this.isPick = true

    if (!this.isAnimating) {
      this.isAnimating = true

      switch (this.curStep) {
      case 'level':
        await this.animSelectLevel()
        break
      case 'side':
        await this.animPickFromSide()
        break
      case 'bottom':
      case 'lay':
        await this.animToggleShowInfo()
        break
      }

      this.isAnimating = false
    }
  }

  async onPickDown() {
    await delay(0.05)
    console.log('Card#onPickDown')
    this.isPointerDown = true

    switch (this.curStep) {
    case 'bottom':
    case 'lay':
      this.prevPos.copyFrom(this.root.position)
      break
    }
  }

  async onPickUp() {
    await delay(0.05)
    this.isPointerDown = false

    if (this.isPick) {
      this.isPick = false
      return
    }

    console.log('Card#onPickUp')

    switch (this.curStep) {
    case 'bottom':
    case 'lay':
      if (!this.isAnimating) {
        this.isAnimating = true
        const pickedMesh = this.experience.slotPicker.getPickedMesh()

        if (pickedMesh) {
          const prefixName = pickedMesh.name.substring(0, 6)

          if (prefixName === 'b-slot') {
            await this.animDrop(pickedMesh)
          }

          if (prefixName === 't-slot') {
            await this.animAttack(pickedMesh)
          }
        } else {
          await this.animPrev()
        }

        this.isAnimating = false
      }
      break
    }
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