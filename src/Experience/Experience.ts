/* eslint-disable @typescript-eslint/no-this-alias */
import * as BABYLON from 'babylonjs'

import {BOARD_ANGLE_FACTOR} from '../utils/constants'
import {Board} from './Board/Board'
import {GameState} from './Utils/GameState'
import {Mouse} from './Utils/Mouse'
import {Raycast} from './Utils/Raycast'

let instance: Experience

export class Experience {
  canvas!: HTMLCanvasElement
  engine!: BABYLON.Engine
  scene!: BABYLON.Scene
  camera!: BABYLON.ArcRotateCamera
  hemisphericLight!: BABYLON.HemisphericLight

  gameState!: GameState
  mouse!: Mouse
  raycast!: Raycast
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
    this.hemisphericLight = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 0), this.scene)

    this.engine.runRenderLoop(() => {
      instance.update()
    })

    window.addEventListener('resize', () => {
      instance.resize()
    })

    // Assets
    this.gameState = new GameState()
    this.mouse = new Mouse()
    this.raycast = new Raycast()
    this.board = new Board()
    this.mouse.dragPlane = this.board.root

    // Utils
    new BABYLON.Debug.AxesViewer(this.scene, 1)
  }

  update() {
    this.scene?.render()
  }

  resize() {
    this.engine?.resize()
  }
}