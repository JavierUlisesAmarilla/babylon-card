/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import {ArrowBox} from './ArrowBox'
import {ArrowHead} from './ArrowHead'
import gsap from 'gsap'

export class Arrow {
  width
  blockSize
  thickness
  blockGap
  bulge
  color4
  gradient
  opacity
  origin
  target
  nbOfPoints = 1000
  arrowBoxArr: ArrowBox[] = []
  arrowHead!: ArrowHead
  frameRate = 0.01

  constructor({
    width = 0.05,
    blockSize = 0.12,
    thickness = 0.005,
    blockGap = 0.02,
    bulge = 0.2,
    color4 = new BABYLON.Color4(1, 0, 0, 0),
    gradient = 0.7,
    opacity = 0.7
  }: {
    width?: number
    blockSize?: number
    thickness?: number
    blockGap?: number
    bulge?: number
    color4?: BABYLON.Color4
    gradient?: number
    opacity?: number
  }) {
    this.width = width
    this.blockSize = blockSize
    this.thickness = thickness
    this.blockGap = blockGap
    this.bulge = bulge
    this.color4 = color4
    this.gradient = gradient
    this.opacity = opacity
    this.origin = new BABYLON.Vector3(-2, -2, -4 * thickness)
    this.target = new BABYLON.Vector3(2, -2, -4 * thickness)
    this.reset()
  }

  reset() {
    const curve = this.getQuadraticBezier()

    // Set arrow boxes
    const visibleBoxCount = Math.ceil(curve.length() / (this.blockSize + this.blockGap))
    const newBoxCount = visibleBoxCount - this.arrowBoxArr.length

    for (let i = 0; i < newBoxCount; i++) { // Add new boxes
      const newArrowBox = new ArrowBox({
        width: this.width,
        blockSize: this.blockSize,
        thickness: this.thickness,
        color4: this.color4,
        gradient: this.gradient,
        opacity: this.opacity,
        frameRate: this.frameRate
      })
      newArrowBox.quadraticBezier = curve
      newArrowBox.startAnim()
      this.arrowBoxArr.push(newArrowBox)
    }

    this.arrowBoxArr.forEach((arrowBox: ArrowBox, index: number) => { // Update arrow boxes' status
      arrowBox.quadraticBezier = curve

      if (index < visibleBoxCount) {
        arrowBox.hide = false
        arrowBox.curDistance = index * (this.blockSize + this.blockGap)
      } else {
        arrowBox.hide = true
      }
    })

    // Set arrow head
    if (!this.arrowHead) {
      this.arrowHead = new ArrowHead({
        width: this.width,
        blockSize: this.blockSize,
        thickness: this.thickness,
        color4: this.color4,
        frameRate: 1.3 * this.frameRate
      })
    }

    this.arrowHead.setCurve3(curve)
  }

  getQuadraticBezier() {
    const middle = BABYLON.Vector3.Lerp(this.origin, this.target, 0.5)
    middle.z -= this.bulge
    let curve = BABYLON.Curve3.CreateQuadraticBezier(this.origin, middle, this.target, this.nbOfPoints)
    const curvePointArr = curve.getPoints()
    const curvePath3d = new BABYLON.Path3D(curvePointArr)
    const curveTangents = curvePath3d.getTangents()

    if (curveTangents.length) {
      const blockLength = this.blockSize + this.blockGap
      const additionalLength = blockLength - curve.length() % blockLength
      const origin = this.origin.clone().add(curveTangents[0].negate().scale(additionalLength))
      curve = BABYLON.Curve3.CreateQuadraticBezier(origin, middle, this.target, this.nbOfPoints)
    }

    return curve
  }

  setOrigin(origin: BABYLON.Vector3) {
    this.origin.copyFrom(origin)
    this.reset()
  }

  animChangeOrigin(origin: BABYLON.Vector3) {
    const duration = 1
    const ease = 'none'
    gsap.timeline().to(this.origin, {x: origin.x, y: origin.y, z: origin.z, duration, ease, onUpdate: () => this.reset()})
  }

  setTarget(target: BABYLON.Vector3) {
    this.target.copyFrom(target)
    this.reset()
  }

  animChangeTarget(target: BABYLON.Vector3) {
    const duration = 1
    const ease = 'none'
    gsap.timeline().to(this.target, {x: target.x, y: target.y, z: target.z, duration, ease, onUpdate: () => this.reset()})
  }
}