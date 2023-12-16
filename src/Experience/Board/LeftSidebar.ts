import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'
import {getLookQuat} from '../../utils/common'
import gsap from 'gsap'

export class LeftSidebar {
  name = 'leftSidebar'
  experience
  root
  rootChild
  width = 1
  height = 0.5
  textureSize = 512
  hidePosX = -2
  showPosX = -0.5

  constructor() {
    this.experience = new Experience()

    this.root = new BABYLON.TransformNode(this.name)
    this.root.parent = this.experience.ui.root
    this.root.position.set(this.hidePosX, 0.2, 3)
    this.root.lookAt(new BABYLON.Vector3(0, 0, 0))
    this.root.rotationQuaternion = BABYLON.Quaternion.Zero()

    this.rootChild = BABYLON.MeshBuilder.CreatePlane(this.name, {width: this.width, height: this.height, sideOrientation: 2}, this.experience.scene)
    this.rootChild.parent = this.root
    this.rootChild.rotation.y = Math.PI
    const rootChildTexture = new BABYLON.DynamicTexture(this.name, {width: this.textureSize * this.width, height: this.textureSize * this.height}, this.experience.scene)
    rootChildTexture.drawText('Sidebar Sentences', 20, 50, 'bold 44px monospace', 'white', 'black', true, true)
    const rootChildMat = new BABYLON.StandardMaterial('Mat', this.experience.scene)
    rootChildMat.diffuseTexture = rootChildTexture
    this.rootChild.material = rootChildMat
    this.rootChild.visibility = 0
  }

  async animShow() {
    const targetPos = this.root.position.clone()
    targetPos.x = this.showPosX
    const lookTarget = BABYLON.Vector3.Zero()
    const lookQuat = getLookQuat(targetPos, lookTarget)
    const duration = 0.2
    const ease = 'circ.inOut'
    await gsap.timeline()
      .to(this.root.position, {x: targetPos.x, y: targetPos.y, z: targetPos.z, duration, ease})
      .to(this.root.rotationQuaternion, {x: lookQuat.x, y: lookQuat.y, z: lookQuat.z, w: lookQuat.w, duration, ease}, 0)
      .to(this.rootChild, {visibility: 1, duration, ease}, 0)
  }

  async animHide() {
    const targetPos = this.root.position.clone()
    targetPos.x = this.hidePosX
    const lookTarget = BABYLON.Vector3.Zero()
    const lookQuat = getLookQuat(targetPos, lookTarget)
    const duration = 0.2
    const ease = 'circ.inOut'
    await gsap.timeline()
      .to(this.root.position, {x: targetPos.x, y: targetPos.y, z: targetPos.z, duration, ease})
      .to(this.root.rotationQuaternion, {x: lookQuat.x, y: lookQuat.y, z: lookQuat.z, w: lookQuat.w, duration, ease}, 0)
      .to(this.rootChild, {visibility: 0, duration, ease}, 0)
  }
}