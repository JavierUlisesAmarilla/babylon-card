/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import {ArrowBox} from './ArrowBox'

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

  constructor({
    boxWidth = 0.25,
    boxLength = 0.5,
    boxDepth = 0.05,
    gap = 0.1,
    bulge = 0,
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
    this.origin = new BABYLON.Vector3(-2, 0, -1)
    this.target = new BABYLON.Vector3(2, 0, -1)
    this.init()
  }

  init() {
    this.setArrowBoxes()
  }

  setArrowBoxes() {
    const middle = BABYLON.Vector3.Lerp(this.origin, this.target, 0.5)
    middle.z -= this.bulge
    const curve = BABYLON.Curve3.CreateQuadraticBezier(this.origin, middle, this.target, this.nbOfPoints)
    const curveLen = curve.length()
    const visibleBoxCount = Math.ceil(curveLen / (this.boxLength + this.gap))
    const newBoxCount = visibleBoxCount - this.arrowBoxArr.length
    console.log('Arrow#setArrowBoxes: newBoxCount: ', newBoxCount)
    let curDistance = 0

    const setCurDistance = () => {
      if (this.arrowBoxArr.length) {
        curDistance = (this.arrowBoxArr[this.arrowBoxArr.length - 1].curDistance + this.boxLength + this.gap) % curveLen
      }
    }

    for (let i = 0; i < newBoxCount; i++) {
      setCurDistance()
      this.arrowBoxArr.push(new ArrowBox({
        quadraticBezier: curve,
        boxWidth: this.boxWidth,
        boxLength: this.boxLength,
        boxDepth: this.boxDepth,
        curDistance,
      }))
    }

    console.log('Arrow#setArrowBoxes: this.arrowBoxArr: ', this.arrowBoxArr)
  }
}