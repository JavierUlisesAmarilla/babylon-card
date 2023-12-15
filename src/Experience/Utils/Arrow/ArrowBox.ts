/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import gsap from 'gsap'

export class ArrowBox {
  root
  quadraticBezier
  boxWidth
  boxLength
  boxDepth
  curDistance
  gapPerFrame = 0.01
  animIntervalIndex!: number

  constructor({
    quadraticBezier,
    boxWidth = 0.5,
    boxLength = 1,
    boxDepth = 0.1,
    curDistance = 0,
    color4 = new BABYLON.Color4(1, 0, 0, 1),
  }: {
    quadraticBezier: BABYLON.Curve3
    boxWidth?: number
    boxLength?: number
    boxDepth?: number
    curDistance?: number
    color4?: BABYLON.Color4
  }) {
    this.root = BABYLON.CreateBox('arrowBox', {width: boxWidth, height: boxLength, depth: boxDepth, faceColors: [color4, color4, color4, color4, color4, color4]})
    this.root.rotationQuaternion = BABYLON.Quaternion.Zero()
    this.quadraticBezier = quadraticBezier
    this.boxWidth = boxWidth
    this.boxLength = boxLength
    this.boxDepth = boxDepth
    this.curDistance = curDistance
    this.loopAnim()
  }

  async loopAnim() {
    const curvePointArr = this.quadraticBezier.getPoints()
    const curveLength = this.quadraticBezier.length()
    const curvePath3d = new BABYLON.Path3D(curvePointArr)
    const curveTangents = curvePath3d.getTangents()
    this.curDistance = (this.curDistance + this.gapPerFrame) % curveLength
    const curPointIndex = Math.ceil(this.curDistance * curvePointArr.length / curveLength) % curvePointArr.length
    const curPoint = curvePointArr[curPointIndex]
    const quatRes = BABYLON.Quaternion.Zero()
    BABYLON.Quaternion.FromUnitVectorsToRef(BABYLON.Axis.Y, curveTangents[curPointIndex], quatRes)
    const posDuration = curPointIndex ? 0.01 : 0
    const rotDuration = curPointIndex ? 0.005 : 0
    const ease = 'none'
    const gsapAnim = gsap.timeline().to(this.root.rotationQuaternion, {x: quatRes.x, y: quatRes.y, z: quatRes.z, w: quatRes.w, duration: rotDuration, ease})
      .to(this.root.position, {x: curPoint.x, y: curPoint.y, z: curPoint.z, duration: posDuration, ease}, 0)
    await gsapAnim
    this.loopAnim()
  }
}