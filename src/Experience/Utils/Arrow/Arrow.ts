/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import {ArrowBox} from './ArrowBox'
import {ArrowHead} from './ArrowHead'

export class Arrow {
  boxWidth
  boxLength
  boxDepth
  gap
  bulge
  color4
  origin
  target
  nbOfPoints = 1000
  arrowBoxArr: ArrowBox[] = []
  arrowHead!: ArrowHead

  constructor({
    boxWidth = 0.05,
    boxLength = 0.12,
    boxDepth = 0.005,
    gap = 0.02,
    bulge = 0.2,
    color4 = new BABYLON.Color4(1, 0, 0, 1),
  }: {
    boxWidth?: number
    boxLength?: number
    boxDepth?: number
    gap?: number
    bulge?: number
    color4?: BABYLON.Color4
  }) {
    this.boxWidth = boxWidth
    this.boxLength = boxLength
    this.boxDepth = boxDepth
    this.gap = gap
    this.bulge = bulge
    this.color4 = color4
    this.origin = new BABYLON.Vector3(-2, -2, -4 * boxDepth)
    this.target = new BABYLON.Vector3(2, -2, -4 * boxDepth)
    this.reset()
  }

  async reset() {
    // Generate quadratic bezier
    const middle = BABYLON.Vector3.Lerp(this.origin, this.target, 0.5)
    middle.z -= this.bulge
    const curve = BABYLON.Curve3.CreateQuadraticBezier(this.origin, middle, this.target, this.nbOfPoints)

    // Set arrow boxes
    const curveLen = curve.length()
    const visibleBoxCount = Math.ceil(curveLen / (this.boxLength + this.gap))
    const newBoxCount = visibleBoxCount - this.arrowBoxArr.length

    for (let i = 0; i < newBoxCount; i++) { // Add new boxes
      this.arrowBoxArr.push(new ArrowBox({
        boxWidth: this.boxWidth,
        boxLength: this.boxLength,
        boxDepth: this.boxDepth,
      }))
    }

    this.arrowBoxArr.forEach(async (arrowBox: ArrowBox, index: number) => { // Update arrow boxes' animation
      arrowBox.stopAnim()

      if (index < visibleBoxCount) {
        arrowBox.curDistance = index * (this.boxLength + this.gap)
        arrowBox.setCurve3AndStartAnim(curve)
      }
    })

    // Set arrow head
    if (!this.arrowHead) {
      this.arrowHead = new ArrowHead({
        boxWidth: this.boxWidth,
        boxLength: this.boxLength,
        boxDepth: this.boxDepth,
      })
    }

    this.arrowHead.setCurve3(curve)
  }

  setOrigin(origin: BABYLON.Vector3) {
    this.origin.copyFrom(origin)
    this.reset()
  }

  setTarget(target: BABYLON.Vector3) {
    this.target.copyFrom(target)
    this.reset()
  }
}