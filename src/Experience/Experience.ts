/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import {Board} from './Board/Board'
import {Drag} from './Utils/Drag'
import {Highlight} from './Utils/Highlight'
import {SlotPicker} from './Board/SlotPicker'
import { Ui } from './Board/Ui'

let instance: Experience

export class Experience {
  canvas!: HTMLCanvasElement
  engine!: BABYLON.Engine
  scene!: BABYLON.Scene
  camera!: BABYLON.ArcRotateCamera
  hemisphericLight!: BABYLON.HemisphericLight
  ui!: Ui
  drag!: Drag
  slotPicker!: SlotPicker
  highlight!: Highlight
  board!: Board

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
    this.camera = new BABYLON.ArcRotateCamera('camera', -0.5 * Math.PI, 0.7 * Math.PI, 5, new BABYLON.Vector3(0, 0, 0))
    this.camera.attachControl(this.canvas, true)
    this.camera.target = new BABYLON.Vector3(0, -0.7, 0)
    this.hemisphericLight = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(-1, 0, 0), this.scene)

    this.engine.runRenderLoop(() => {
      instance.update()
    })

    window.addEventListener('resize', () => {
      instance.resize()
    })

    // Assets
    this.ui = new Ui()
    this.drag = new Drag()
    this.slotPicker = new SlotPicker()
    this.highlight = new Highlight()
    this.board = new Board()

    // Utils
    // new BABYLON.Debug.AxesViewer(this.scene, 1)
  }

  update() {
    this.scene?.render()
    this.board.update()
  }

  resize() {
    this.engine?.resize()
  }
}