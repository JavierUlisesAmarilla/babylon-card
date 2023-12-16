import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience'

export class Ui {
  name = 'ui'
  experience
  root

  constructor() {
    this.experience = new Experience()
    this.root = new BABYLON.TransformNode(this.name)
    this.root.parent = this.experience.camera
  }
}