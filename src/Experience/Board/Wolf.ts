/* eslint-disable @typescript-eslint/no-this-alias */
import 'babylonjs-loaders'

import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'
import {getZLookQuat} from '../../utils/common'
import gsap from 'gsap'

const halfW = 1.4
const halfH = 2
const clampGap = 0.05
let instance: Wolf

export class Wolf {
  name = 'wolf'
  experience
  root
  animations: {[key: string]: BABYLON.AnimationGroup} = {}
  rootChild
  isMoving = false
  gsapAnim!: gsap.core.Timeline
  moveToTimeoutIndex!: number
  curAnimKey!: string
  pathPointArr = [
    new BABYLON.Vector3(-halfW, halfH, 0),
    new BABYLON.Vector3(-halfW, -halfH, 0),
    new BABYLON.Vector3(halfW, -halfH, 0),
    new BABYLON.Vector3(halfW, halfH, 0),
  ]

  constructor() {
    instance = this
    this.experience = new Experience()
    this.root = new BABYLON.TransformNode(this.name)
    this.rootChild = new BABYLON.TransformNode(this.name)
    this.rootChild.parent = this.root
    this.init()
  }

  async init() {
    // Root
    this.root.position.set(0, halfH, 0)
    this.root.rotationQuaternion = getZLookQuat(this.root.position, BABYLON.Vector3.Zero())

    // Root child
    const {meshes, animationGroups} = await BABYLON.SceneLoader.ImportMeshAsync('', '/assets/models/', 'wolf.glb', this.experience.scene)

    meshes.forEach(mesh => {
      mesh.parent = this.rootChild
      mesh.isPickable = false
    })

    this.rootChild.rotation.z = Math.PI

    // Animations
    this.animations['run'] = animationGroups[0]
    this.animations['walk'] = animationGroups[1]
    this.animations['creep'] = animationGroups[2]
    this.animations['idle'] = animationGroups[3]
    this.animations['site'] = animationGroups[4]
    this.playIdleAnimation()
    this.moveAround()
  }

  playAllAnimations() {
    Object.values(this.animations).forEach(animation => animation.start(true))
  }

  stopAllAnimations() {
    Object.values(this.animations).forEach(animation => animation.stop())
  }

  playIdleAnimation() {
    this.playAllAnimations()
    this.changeAnimation('idle')
  }

  async moveThroughPath(points: BABYLON.Vector3[]) {
    if (this.isMoving) {
      return
    }

    this.isMoving = true

    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      const orient = getZLookQuat(this.root.position, point)
      const posDuration = point.clone().subtract(this.root.position).length() * 0.5
      const rotDuration = 0.3
      const ease = 'none'

      if (!this.root.position.equals(point)) {
        this.changeAnimation('run')
        this.gsapAnim = gsap.timeline()
          .to(this.root.rotationQuaternion, {x: orient.x, y: orient.y, z: orient.z, w: orient.w, duration: rotDuration, ease})
          .to(this.root.position, {x: point.x, y: point.y, z: point.z, duration: posDuration, ease}, 0)
        await this.gsapAnim
      }
    }

    this.changeAnimation('idle')
    this.isMoving = false
  }

  stopMove() {
    if (this.gsapAnim) {
      this.gsapAnim.kill()
    }

    this.isMoving = false
  }

  async moveTo(target: BABYLON.Vector3) {
    clearTimeout(this.moveToTimeoutIndex)
    this.stopMove()
    await this.moveThroughPath([this.root.position, target])
    this.moveToTimeoutIndex = setTimeout(() => this.moveAround(), 5000)
  }

  async moveAround() {
    await this.moveThroughPath(this.pathPointArr)
    this.moveAround()
  }

  onBeforeAnimations() {
    if (!instance.animations) {
      return
    }

    Object.keys(instance.animations).forEach((key: string) => {
      if (instance.curAnimKey === key) {
        instance.animations[key].weight = BABYLON.Scalar.Clamp(instance.animations[key].weight + clampGap, 0, 1)
      } else {
        instance.animations[key].weight = BABYLON.Scalar.Clamp(instance.animations[key].weight - clampGap, 0, 1)
      }
    })

    if (instance.curAnimKey && instance.animations[instance.curAnimKey].weight === 1) {
      instance.experience.scene.onBeforeAnimationsObservable.removeCallback(instance.onBeforeAnimations)
    }
  }

  changeAnimation(animKey: string) {
    this.experience.scene.onBeforeAnimationsObservable.removeCallback(instance.onBeforeAnimations)
    this.curAnimKey = animKey
    this.experience.scene.onBeforeAnimationsObservable.add(instance.onBeforeAnimations)
  }
}