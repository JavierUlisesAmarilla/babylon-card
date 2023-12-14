import 'babylonjs-loaders'

import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'
import {getLookQuat} from '../../utils/common'

export class Wolf {
  experience
  root
  animations: {[key: string]: BABYLON.AnimationGroup} = {}

  constructor() {
    this.experience = new Experience()
    this.root = new BABYLON.TransformNode('wolf')
    this.root.position.set(0, 2.2, 0)
    this.root.rotationQuaternion = new BABYLON.Quaternion()
    this.root.lookAt(new BABYLON.Vector3(0, 3, 0))
    this.init()
  }

  async init() {
    const {meshes, animationGroups} = await BABYLON.SceneLoader.ImportMeshAsync('', '/assets/models/', 'wolf.glb', this.experience.scene)

    const wolfWrap = new BABYLON.TransformNode('wolfWrap')
    wolfWrap.parent = this.root
    wolfWrap.position.x = 0.1
    wolfWrap.rotation.z = -0.5 * Math.PI
    meshes.forEach(mesh => mesh.parent = wolfWrap)

    animationGroups.forEach(animationGroup => animationGroup.stop())
    this.animations['run'] = animationGroups[0]
    this.animations['walk'] = animationGroups[1]
    this.animations['creep'] = animationGroups[2]
    this.animations['idle'] = animationGroups[3]
    this.animations['site'] = animationGroups[4]
    this.animations['idle'].start(true)
  }

  async moveTo(target: BABYLON.Vector3) {
    console.log('Wolf#moveTo: target: ', target)
    const lookQuat = getLookQuat(this.root.position, target)
    this.root.rotationQuaternion?.copyFrom(lookQuat)
  }
}