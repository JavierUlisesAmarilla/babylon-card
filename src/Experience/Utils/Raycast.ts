/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import {EventEmitter} from './EventEmitter'
import {Experience} from '../Experience'

export class Raycast extends EventEmitter {
  experience
  scene

  raycastMeshes: BABYLON.AbstractMesh[] = []

  constructor() {
    super()

    this.experience = new Experience()
    this.scene = this.experience.scene
  }

  addMeshes(meshes: BABYLON.AbstractMesh[]) {
    this.raycastMeshes.push(...meshes)
  }

  getPickedMesh(exceptedMeshes: BABYLON.AbstractMesh[] = []) {
    const pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh: BABYLON.AbstractMesh) => {
      return (this.raycastMeshes.indexOf(mesh) > -1) && (exceptedMeshes.indexOf(mesh) === -1)
    })
    return pickInfo?.pickedMesh
  }
}