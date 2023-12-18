/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

export class Curve3Helper {
  curve3
  size
  lineCurve!: BABYLON.LinesMesh
  lineTangentArr: BABYLON.LinesMesh[] = []
  lineNormalArr: BABYLON.LinesMesh[] = []
  lineBinormalArr: BABYLON.LinesMesh[] = []

  constructor({
    curve3,
    size = 0.5
  }: {
    curve3?: BABYLON.Curve3
    size?: number
  }) {
    this.curve3 = curve3
    this.size = size
    this.reset()
  }

  reset() {
    // Format
    this.lineCurve?.dispose()
    this.lineTangentArr.forEach(lineTangent => lineTangent.dispose())
    this.lineNormalArr.forEach(lineNormal => lineNormal.dispose())
    this.lineBinormalArr.forEach(lineBinormal => lineBinormal.dispose())

    if (!this.curve3) {
      return
    }

    // Redraw
    const curve3PointArr = this.curve3.getPoints()
    const curve3Path3d = new BABYLON.Path3D(curve3PointArr)
    const tangents = curve3Path3d.getTangents()
    const normals = curve3Path3d.getNormals()
    const binormals = curve3Path3d.getBinormals()
    this.lineCurve = BABYLON.CreateLines('lineCurve', {points: curve3PointArr})
    this.lineCurve.isPickable = false
    this.lineCurve.color = BABYLON.Color3.Yellow()

    for (let i = 0; i < curve3PointArr.length; i++) {
      const lineTangent = BABYLON.CreateLines('lineTangent' + i, {points: [curve3PointArr[i], curve3PointArr[i].add(tangents[i].scale(this.size))]})
      this.lineTangentArr.push(lineTangent)
      const lineNormal = BABYLON.CreateLines('lineNormal' + i, {points: [curve3PointArr[i], curve3PointArr[i].add(normals[i].scale(this.size))]})
      this.lineNormalArr.push(lineNormal)
      const lineBinormal = BABYLON.CreateLines('lineBinormal' + i, {points: [curve3PointArr[i], curve3PointArr[i].add(binormals[i].scale(this.size))]})
      this.lineBinormalArr.push(lineBinormal)
      lineTangent.isPickable = false
      lineTangent.color = BABYLON.Color3.Red()
      lineNormal.isPickable = false
      lineNormal.color = BABYLON.Color3.Green()
      lineBinormal.isPickable = false
      lineBinormal.color = BABYLON.Color3.Blue()
    }
  }

  setCurve3(curve3: BABYLON.Curve3) {
    this.curve3 = curve3
    this.reset()
  }
}