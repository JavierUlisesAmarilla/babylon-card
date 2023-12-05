import * as BABYLON from 'babylonjs'

import {Board} from './Board/Board';

let instance: Experience

export class Experience {
  canvas: any
  engine: any
  scene: any
  camera: any
  hemisphericLight: any
  board: any

  constructor() {
    if (instance) {
      return instance
    }

    instance = this
  }

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.engine = new BABYLON.Engine(this.canvas, true)

    this.scene = new BABYLON.Scene(this.engine)

    this.camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 7, new BABYLON.Vector3(0, 0, 0))
    this.camera.attachControl(this.canvas, true)

    this.hemisphericLight = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 0), this.scene)

    this.engine.runRenderLoop(() => {
      instance.update()
    })

    window.addEventListener('resize', () => {
      instance.resize()
    })

    // Utils
    new BABYLON.Debug.AxesViewer(this.scene, 1)

    // Assets
    this.board = new Board()
  }

  update() {
    this.scene?.render()
  }

  resize() {
    this.engine?.resize()
  }
}