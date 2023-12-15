/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import {delay} from '../../../utils/common'
import gsap from 'gsap'

export class ArrowBox {
  root
  quadraticBezier!: BABYLON.Curve3
  curDistance = 0
  gapPerFrame = 0.01
  frameRate = 0.05
  isLoopAnim = false
  maxVisibleDistanceRate = 0.7
  minVisibleDistanceRate = 0.03

  constructor({
    boxWidth,
    boxLength,
    boxDepth,
    color4 = new BABYLON.Color4(1, 0, 0, 1),
  }: {
    boxWidth: number
    boxLength: number
    boxDepth: number
    color4?: BABYLON.Color4
  }) {
    this.root = BABYLON.CreateBox('arrowBox', {width: boxWidth, height: boxLength, depth: boxDepth, faceColors: [color4, color4, color4, color4, color4, color4]})
    this.root.rotationQuaternion = BABYLON.Quaternion.Zero()
  }

  startAnim() {
    this.isLoopAnim = true
    this.loopAnim()
  }

  async stopAnim() {
    this.isLoopAnim = false
    await delay(2 * this.frameRate)
    this.root.visibility = 0
  }

  setCurve3(curve3: BABYLON.Curve3) {
    this.quadraticBezier = curve3
    this.startAnim()
  }

  async loopAnim() {
    if (!this.isLoopAnim || !this.quadraticBezier) {
      return
    }

    const curvePointArr = this.quadraticBezier.getPoints()
    const curveLength = this.quadraticBezier.length()
    const curvePath3d = new BABYLON.Path3D(curvePointArr)
    const curveTangents = curvePath3d.getTangents()
    this.curDistance = (this.curDistance + this.gapPerFrame) % curveLength
    const curPointIndex = Math.ceil(this.curDistance * curvePointArr.length / curveLength) % curvePointArr.length
    const curQuat = BABYLON.Quaternion.Zero()
    BABYLON.Quaternion.FromUnitVectorsToRef(BABYLON.Axis.Y, curveTangents[curPointIndex], curQuat)
    const curPos = curvePointArr[curPointIndex]
    let curVisibility = 1

    if (this.curDistance / curveLength < this.maxVisibleDistanceRate) {
      curVisibility = Math.min(this.curDistance / (curveLength * this.maxVisibleDistanceRate), 1)
    } else if (((curveLength - this.curDistance) / curveLength) < this.minVisibleDistanceRate) {
      curVisibility = 0
    }

    const ease = 'none'
    await gsap.timeline()
      .to(this.root.rotationQuaternion, {x: curQuat.x, y: curQuat.y, z: curQuat.z, w: curQuat.w, duration: this.frameRate, ease})
      .to(this.root.position, {x: curPos.x, y: curPos.y, z: curPos.z, duration: this.frameRate, ease}, 0)
      .to(this.root, {visibility: curVisibility, duration: this.frameRate, ease}, 0)

    this.loopAnim()
  }
}