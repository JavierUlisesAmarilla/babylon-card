/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import {EventEmitter} from '../Utils/EventEmitter'
import {Experience} from '../Experience'

export class SlotPicker extends EventEmitter {
  experience
  raycastMeshes: BABYLON.AbstractMesh[] = []

  constructor() {
    super()

    this.experience = new Experience()
  }

  addMeshes(meshes: BABYLON.AbstractMesh[]) {
    this.raycastMeshes.push(...meshes)
  }

  getPickedMesh(exceptedMeshes: BABYLON.AbstractMesh[] = []) {
    const pickInfo = this.experience.scene.pick(this.experience.scene.pointerX, this.experience.scene.pointerY, (mesh: BABYLON.AbstractMesh) => {
      return (this.raycastMeshes.indexOf(mesh) > -1) && (exceptedMeshes.indexOf(mesh) === -1)
    })
    return pickInfo?.pickedMesh
  }
}