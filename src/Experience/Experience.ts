/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import {BOARD_ANGLE_FACTOR} from '../utils/constants'
import {Board} from './Board/Board'
import {Drag} from './Utils/Drag'
import {GameState} from './Utils/GameState'
import {Highlight} from './Utils/Highlight'
import {SlotPicker} from './Board/SlotPicker'

let instance: Experience

export class Experience {
  canvas!: HTMLCanvasElement
  engine!: BABYLON.Engine
  scene!: BABYLON.Scene
  camera!: BABYLON.ArcRotateCamera
  hemisphericLight!: BABYLON.HemisphericLight

  gameState!: GameState
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
    this.camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI * (0.5 + BOARD_ANGLE_FACTOR), 5, new BABYLON.Vector3(0, 0, 0))
    this.camera.attachControl(this.canvas, true)
    this.hemisphericLight = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 0, -1), this.scene)

    this.engine.runRenderLoop(() => {
      instance.update()
    })

    window.addEventListener('resize', () => {
      instance.resize()
    })

    // Assets
    this.gameState = new GameState()
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