/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import gsap from 'gsap'

export class ArrowBox {
  root
  quadraticBezier
  curDistance
  gapPerFrame = 0.01
  frameRate = 0.01
  isLoopAnim = false
  maxVisibleDistanceRate = 0.7
  minVisibleDistanceRate = 0.06

  constructor({
    quadraticBezier,
    boxWidth,
    boxLength,
    boxDepth,
    curDistance,
    color4 = new BABYLON.Color4(1, 0, 0, 1),
  }: {
    quadraticBezier: BABYLON.Curve3
    boxWidth: number
    boxLength: number
    boxDepth: number
    curDistance: number
    color4?: BABYLON.Color4
  }) {
    this.root = BABYLON.CreateBox('arrowBox', {width: boxWidth, height: boxLength, depth: boxDepth, faceColors: [color4, color4, color4, color4, color4, color4]})
    this.root.rotationQuaternion = BABYLON.Quaternion.Zero()
    this.quadraticBezier = quadraticBezier
    this.curDistance = curDistance
    this.startAnim()
  }

  startAnim() {
    this.isLoopAnim = true
    this.loopAnim()
  }

  stopAnim() {
    this.isLoopAnim = false
    this.root.visibility = 0
  }

  setCurve3(curve3: BABYLON.Curve3) {
    this.quadraticBezier = curve3
  }

  async loopAnim() {
    if (!this.isLoopAnim) {
      false
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