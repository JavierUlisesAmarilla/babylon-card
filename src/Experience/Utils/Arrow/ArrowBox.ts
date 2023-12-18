/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import {getZLookQuat} from '../../../utils/common'
import gsap from 'gsap'

export class ArrowBox {
  name = 'arrowBox'
  root
  rootChild
  blockSize
  gradient
  opacity
  frameRate
  quadraticBezier!: BABYLON.Curve3
  curDistance = 0
  gapPerFrame = 0.01
  hide = false

  constructor({
    width,
    blockSize,
    thickness,
    color4,
    gradient,
    opacity,
    frameRate,
  }: {
    width: number
    blockSize: number
    thickness: number
    color4: BABYLON.Color4
    gradient: number
    opacity: number
    frameRate: number
  }) {
    this.root = new BABYLON.TransformNode(this.name)
    this.root.position.z = 100
    this.root.rotationQuaternion = BABYLON.Quaternion.Zero()
    this.rootChild = BABYLON.CreateBox(this.name, {width, height: blockSize, depth: thickness, faceColors: [color4, color4, color4, color4, color4, color4]})
    this.rootChild.parent = this.root
    this.rootChild.isPickable = false
    this.rootChild.rotation.x = 0.5 * Math.PI
    this.blockSize = blockSize
    this.gradient = gradient
    this.opacity = opacity
    this.frameRate = frameRate
  }

  startAnim() {
    if (!this.quadraticBezier) {
      return
    }

    const curvePointArr = this.quadraticBezier.getPoints()
    const curveLength = this.quadraticBezier.length()
    const curvePath3d = new BABYLON.Path3D(curvePointArr)
    const curveTangents = curvePath3d.getTangents()
    this.curDistance = (this.curDistance + this.gapPerFrame) % curveLength
    const curPointIndex = Math.ceil(this.curDistance * curvePointArr.length / curveLength) % curvePointArr.length
    const curQuat = getZLookQuat(BABYLON.Vector3.Zero(), curveTangents[curPointIndex])
    const curPos = curvePointArr[curPointIndex]
    const ease = 'none'
    const visibility = curveLength - this.curDistance > this.blockSize ? Math.min(this.curDistance / (curveLength * this.gradient), this.opacity) : 0
    gsap.timeline()
      .to(this.rootChild, {
        visibility,
        duration: this.frameRate,
        ease,
        onUpdate: () => {this.onUpdate()},
      })
      .to(this.root.rotationQuaternion, {
        x: curQuat.x,
        y: curQuat.y,
        z: curQuat.z,
        w: curQuat.w,
        duration: this.frameRate,
        ease,
        onUpdate: () => {this.onUpdate()},
      }, 0)
      .to(this.root.position, {
        x: curPos.x,
        y: curPos.y,
        z: curPos.z,
        duration: this.frameRate,
        ease,
        onUpdate: () => {this.onUpdate()},
        onComplete: () => {this.startAnim()},
      }, 0)
  }

  onUpdate() {
    if (this.hide) {
      this.rootChild.visibility = 0
    }
  }
}