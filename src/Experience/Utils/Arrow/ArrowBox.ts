/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import {delay} from '../../../utils/common'

export class ArrowBox {
  root
  quadraticBezier
  curDistance
  gapPerFrame = 0.01
  frameRate = 0.01
  isLoopAnim = false

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
    this.curDistance = curDistance
    this.startAnim()
  }

  startAnim() {
    this.isLoopAnim = true
    this.loopAnim()
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
    const quatRes = BABYLON.Quaternion.Zero()
    BABYLON.Quaternion.FromUnitVectorsToRef(BABYLON.Axis.Y, curveTangents[curPointIndex], quatRes)
    const curPoint = curvePointArr[curPointIndex]
    this.root.rotationQuaternion?.copyFrom(quatRes)
    this.root.position.copyFrom(curPoint)
    await delay(this.frameRate)
    this.loopAnim()
  }
}