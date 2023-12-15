/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

export class ArrowHead {
  name = 'arrowHead'
  root

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
    this.root = new BABYLON.TransformNode(this.name)
    this.root.rotationQuaternion = BABYLON.Quaternion.Zero()

    const cylinder = BABYLON.MeshBuilder.CreateCylinder(this.name, {tessellation: 3, diameter: 2 * boxWidth, height: boxDepth, faceColors: [color4, color4, color4]})
    cylinder.parent = this.root
    cylinder.rotation.x = 0.5 * Math.PI

    const boxHeight = boxLength - 2 * boxWidth

    if (boxHeight > 0) {
      const box = BABYLON.CreateBox(this.name, {width: boxWidth, height: boxHeight, depth: boxDepth, faceColors: [color4, color4, color4, color4, color4, color4]})
      box.parent = this.root
      box.position.x = -boxHeight
      box.rotation.z = 0.5 * Math.PI
    }
  }

  setCurve3(curve3: BABYLON.Curve3) {
    const curvePointArr = curve3.getPoints()
    const curvePath3d = new BABYLON.Path3D(curvePointArr)
    const curveTangents = curvePath3d.getTangents()
    this.root.position.copyFrom(curvePointArr[curvePointArr.length - 1])
    const curQuat = BABYLON.Quaternion.Zero()
    BABYLON.Quaternion.FromUnitVectorsToRef(BABYLON.Axis.X, curveTangents[curveTangents.length - 1], curQuat)
    this.root.rotationQuaternion?.copyFrom(curQuat)
  }
}