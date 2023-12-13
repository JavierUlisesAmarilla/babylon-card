import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'

export class LeftSidebar {
  name
  experience
  root
  width = 1
  height = 0.5
  textureSize = 512
  hidePosX = -2
  showPosX = -0.5
  lookXOffset = -0.05

  constructor({
    name,
  }: {
    name: string
  }) {
    this.name = name
    this.experience = new Experience()
    this.root = BABYLON.MeshBuilder.CreatePlane(name, {width: this.width, height: this.height, sideOrientation: 2}, this.experience.scene)
    this.root.position.set(this.hidePosX, -2, -1.2)
    this.root.lookAt(new BABYLON.Vector3(this.hidePosX - this.lookXOffset, 0, 0))
    const rootTexture = new BABYLON.DynamicTexture(name, {width: this.textureSize * this.width, height: this.textureSize * this.height}, this.experience.scene)
    const rootMat = new BABYLON.StandardMaterial('Mat', this.experience.scene)
    rootMat.diffuseTexture = rootTexture
    this.root.material = rootMat
    const font = 'bold 44px monospace'
    rootTexture.drawText('Sidebar Sentences', 20, 50, font, 'white', 'black', true, true)
    this.root.visibility = 0
  }

  async animShow() {
    this.root.visibility = 1
    this.root.position.x = this.showPosX
    this.root.lookAt(new BABYLON.Vector3(this.showPosX - this.lookXOffset, 0, 0))
  }

  async animHide() {
    this.root.visibility = 0
    this.root.position.x = this.hidePosX
    this.root.lookAt(new BABYLON.Vector3(this.hidePosX - this.lookXOffset, 0, 0))
  }
}