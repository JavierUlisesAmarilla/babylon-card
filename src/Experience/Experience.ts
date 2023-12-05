import * as BABYLON from 'babylonjs'

let instance: Experience

export class Experience {
  canvas: any
  engine: any
  scene: any
  camera: any

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

    this.camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0))
    this.camera.attachControl(this.canvas, true)

    new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 0), this.scene)

    this.engine.runRenderLoop(() => {
      instance.update()
    })

    window.addEventListener('resize', () => {
      instance.resize()
    })

    this.loadScene()
  }

  update() {
    this.scene?.render()
  }

  resize() {
    console.log('Experience#resize')
    this.engine?.resize()
  }

  loadScene() {
    BABYLON.SceneLoader.ImportMeshAsync('', 'https://assets.babylonjs.com/meshes/', 'box.babylon')
  }
}