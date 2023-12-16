/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import gsap from 'gsap'

export class ArrowHead {
  name = 'arrowHead'
  root
  frameRate

  constructor({
    frameRate,
    width,
    blockSize,
    thickness,
    color4,
  }: {
    frameRate: number
    width: number
    blockSize: number
    thickness: number
    color4: BABYLON.Color4
  }) {
    this.root = new BABYLON.TransformNode(this.name)
    this.root.rotationQuaternion = BABYLON.Quaternion.Zero()
    this.frameRate = frameRate

    const cylinder = BABYLON.MeshBuilder.CreateCylinder(this.name, {tessellation: 3, diameter: 2 * width, height: thickness, faceColors: [color4, color4, color4]})
    cylinder.parent = this.root
    cylinder.rotation.x = 0.5 * Math.PI

    const boxHeight = blockSize - 2 * width

    if (boxHeight > 0) {
      const box = BABYLON.CreateBox(this.name, {width, height: boxHeight, depth: thickness, faceColors: [color4, color4, color4, color4, color4, color4]})
      box.parent = this.root
      box.position.x = -1.7 * boxHeight
      box.rotation.z = 0.5 * Math.PI
    }
  }

  setCurve3(curve3: BABYLON.Curve3) {
    const curvePointArr = curve3.getPoints()
    const curvePath3d = new BABYLON.Path3D(curvePointArr)
    const curveTangents = curvePath3d.getTangents()
    const curQuat = BABYLON.Quaternion.Zero()
    BABYLON.Quaternion.FromUnitVectorsToRef(BABYLON.Axis.X, curveTangents[curveTangents.length - 1], curQuat)
    const curPos = curvePointArr[curvePointArr.length - 1]
    const ease = 'none'
    gsap.timeline()
      .to(this.root.rotationQuaternion, {
        x: curQuat.x,
        y: curQuat.y,
        z: curQuat.z,
        w: curQuat.w,
        duration: this.frameRate,
        ease,
      })
      .to(this.root.position, {
        x: curPos.x,
        y: curPos.y,
        z: curPos.z,
        duration: this.frameRate,
        ease,
      }, 0)
  }
}