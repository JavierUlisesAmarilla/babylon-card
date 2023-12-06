import * as BABYLON from 'babylonjs'

import {BOARD_ANGLE_FACTOR, GAP, LAYER_CARD_Z, LAYER_PICK_Z, MAX_ANIM_FRAME_TO} from '../../utils/constants'

import {Experience} from '../Experience'

export class Card {
  experience
  raycast
  scene
  gameState
  mouse
  highlight
  root

  isPointerDown = false
  isPicked = false
  prevPos = new BABYLON.Vector3()
  prevRot = new BABYLON.Vector3()
  isAnimating = false

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
    this.raycast = this.experience.raycast
    this.scene = this.experience.scene
    this.gameState = this.experience.gameState
    this.mouse = this.experience.mouse
    this.highlight = this.experience.highlight
    this.root = new BABYLON.TransformNode(name)
    this.root.position.copyFrom(position)
    this.root.rotation.y = Math.PI

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

    this.mouse.on('pointerDown', async (root: BABYLON.Mesh) => {
      if (root.name === name && !this.isAnimating) {
        this.isAnimating = true

        switch (this.gameState.step) {
        case 'select':
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

    this.mouse.on('pointerMove', (root: BABYLON.Mesh, diff: BABYLON.Vector3) => {
      if (root.name === name && this.isPointerDown && this.gameState.step === 'play') {
        this.root.position.addInPlace(diff)
      }
    })

    this.mouse.on('pointerUp', async () => {
      if (this.isPointerDown && !this.isAnimating) {
        this.isAnimating = true
        const pickedMesh = this.raycast.getPickedMesh()

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
        value: this.root.position.clone()
      },
      {
        frame: 10,
        value: new BABYLON.Vector3(0, -3, -3)
      },
      {
        frame: 20,
        value: new BABYLON.Vector3(0, -3, -3)
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
        value: this.root.rotation.clone()
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
        value: this.root.position.clone()
      },
      {
        frame: 10,
        value: new BABYLON.Vector3(0, -2.35, LAYER_PICK_Z)
      },
    ])

    const animRot = new BABYLON.Animation('animRot', 'rotation', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animRot.setKeys([
      {
        frame: 0,
        value: this.root.rotation.clone()
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
        value: this.root.scaling.clone()
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
        value: this.root.position.clone()
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
        value: this.root.rotation.clone()
      },
      {
        frame: 10,
        value: pickedMesh.rotation.clone()
      },
    ])

    const animScale = new BABYLON.Animation('animScale', 'scaling', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animScale.setKeys([
      {
        frame: 0,
        value: this.root.scaling.clone()
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
        value: this.root.position.clone()
      },
      {
        frame: 10,
        value: this.prevPos.clone()
      },
    ])

    const animRot = new BABYLON.Animation('animRot', 'rotation', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
    animRot.setKeys([
      {
        frame: 0,
        value: this.root.rotation.clone()
      },
      {
        frame: 10,
        value: this.prevRot.clone()
      },
    ])

    await this.scene.beginDirectAnimation(this.root, [animPos, animRot], 0, MAX_ANIM_FRAME_TO, false).waitAsync()
  }
}