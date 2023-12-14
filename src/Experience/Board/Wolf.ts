import 'babylonjs-loaders'

import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'
import gsap from 'gsap'

const halfW = 1.4
const halfH = 2

export class Wolf {
  name = 'wolf'
  experience
  root
  animations: {[key: string]: BABYLON.AnimationGroup} = {}
  rootChild
  isMoving = false
  gsapAnim!: gsap.core.Timeline
  moveToTimeoutIndex!: number

  constructor() {
    this.experience = new Experience()
    this.root = new BABYLON.TransformNode(this.name)
    this.root.position.set(-halfW, halfH, 0)
    this.root.rotationQuaternion = BABYLON.Quaternion.Zero()
    this.rootChild = new BABYLON.TransformNode(this.name)
    this.rootChild.parent = this.root
    this.init()
  }

  async init() {
    const {meshes, animationGroups} = await BABYLON.SceneLoader.ImportMeshAsync('', '/assets/models/', 'wolf.glb', this.experience.scene)
    meshes.forEach(mesh => mesh.parent = this.rootChild)
    this.rootChild.position.z = -0.1
    this.rootChild.rotation.x = -0.5 * Math.PI
    this.animations['run'] = animationGroups[0]
    this.animations['walk'] = animationGroups[1]
    this.animations['creep'] = animationGroups[2]
    this.animations['idle'] = animationGroups[3]
    this.animations['site'] = animationGroups[4]
    this.stopAllAnimations()
    this.animations['idle'].start(true)
    this.moveAround()
  }

  stopAllAnimations() {
    Object.values(this.animations).forEach(animation => animation.stop())
  }

  async moveThroughPath(points: BABYLON.Vector3[]) {
    if (this.isMoving) {
      return
    }

    this.isMoving = true
    const path3d = new BABYLON.Path3D(points)
    const tangents = path3d.getTangents()
    const fixedForward = BABYLON.Axis.Y
    const orientationRes = BABYLON.Quaternion.Zero()

    const orientation = (p: number) => {
      BABYLON.Quaternion.FromUnitVectorsToRef(fixedForward, tangents[p], orientationRes)
      return orientationRes.clone()
    }

    this.stopAllAnimations()

    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      const orient = orientation(i)
      const posDuration = point.clone().subtract(this.root.position).length() * 0.5
      const rotDuration = 0.3
      const ease = 'none'

      if (!this.root.position.equals(point)) {
        this.animations['run'].start(true)
        this.rootChild.position.z = 0
        this.gsapAnim = gsap.timeline().to(this.root.rotationQuaternion, {x: orient.x, y: orient.y, z: orient.z, w: orient.w, duration: rotDuration, ease})
          .to(this.root.position, {x: point.x, y: point.y, z: point.z, duration: posDuration, ease}, 0)
        await this.gsapAnim
        this.animations['run'].stop()
      }
    }

    this.rootChild.position.z = -0.1
    this.animations['idle'].start(true)
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
    this.moveToTimeoutIndex = setTimeout(() => this.moveAround(), 3000)
  }

  async moveAround() {
    this.stopMove()
    const pointArr = [
      this.root.position,
      new BABYLON.Vector3(-halfW, halfH, 0),
      new BABYLON.Vector3(-halfW, -halfH, 0),
      new BABYLON.Vector3(halfW, -halfH, 0),
      new BABYLON.Vector3(halfW, halfH, 0),
    ]

    for (let i = 1; i < pointArr.length; i++) {
      await this.moveThroughPath([pointArr[i - 1], pointArr[i]])
    }

    this.moveAround()
  }
}