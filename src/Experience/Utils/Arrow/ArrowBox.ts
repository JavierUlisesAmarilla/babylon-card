/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import gsap from 'gsap'

export class ArrowBox {
  root
  blockSize
  gradient
  opacity
  quadraticBezier!: BABYLON.Curve3
  curDistance = 0
  gapPerFrame = 0.01
  frameRate = 0.01
  gsapAnim!: gsap.core.Timeline

  constructor({
    width,
    blockSize,
    thickness,
    color4,
    gradient,
    opacity,
  }: {
    width: number
    blockSize: number
    thickness: number
    color4: BABYLON.Color4
    gradient: number
    opacity: number
  }) {
    this.root = BABYLON.CreateBox('arrowBox', {width, height: blockSize, depth: thickness, faceColors: [color4, color4, color4, color4, color4, color4]})
    this.root.rotationQuaternion = BABYLON.Quaternion.Zero()
    this.blockSize = blockSize
    this.gradient = gradient
    this.opacity = opacity
  }

  stopAnim() {
    this.gsapAnim?.kill()
    this.root.visibility = 0
  }

  setCurve3AndStartAnim(curve3: BABYLON.Curve3) {
    this.quadraticBezier = curve3
    this.startAnim()
  }

  async startAnim() {
    if (!this.quadraticBezier) {
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
    const ease = 'none'
    const visibility = curveLength - this.curDistance > this.blockSize ? Math.min(this.curDistance / (curveLength * this.gradient), this.opacity) : 0
    this.gsapAnim = gsap.timeline()
      .to(this.root.rotationQuaternion, {x: curQuat.x, y: curQuat.y, z: curQuat.z, w: curQuat.w, duration: this.frameRate, ease})
      .to(this.root.position, {x: curPos.x, y: curPos.y, z: curPos.z, duration: this.frameRate, ease}, 0)
      .to(this.root, {visibility, duration: this.frameRate, ease}, this.frameRate)
    await this.gsapAnim
    this.startAnim()
  }
}