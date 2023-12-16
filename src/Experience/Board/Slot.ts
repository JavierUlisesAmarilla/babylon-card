import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'
import {GAP} from '../../utils/constants'

export class Slot {
  experience
  root

  constructor({
    name, // Should be unique
    width,
    height,
    position
  }: {
    name: string
    width: number
    height: number
    position: BABYLON.Vector3
  }) {
    this.experience = new Experience()
    this.root = BABYLON.MeshBuilder.CreatePlane(name, {width, height}, this.experience.scene)
    const material = new BABYLON.StandardMaterial(name)
    material.diffuseTexture = new BABYLON.Texture('assets/images/slot.webp')
    this.root.material = material
    this.root.position.copyFrom(position)
    this.experience.slotPicker.addMeshes([this.root])
    this.root.actionManager = new BABYLON.ActionManager(this.experience.scene)
    this.root.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPickTrigger}, (e: BABYLON.ActionEvent) => this.onPick(e)))
  }

  onPick(e: BABYLON.ActionEvent) {
    const pickedPoint = e.additionalData.pickedPoint
    this.experience.board.wolf.moveTo(pickedPoint)
    pickedPoint.z -= GAP
    this.experience.board.arrow.setOrigin(pickedPoint)
  }
}