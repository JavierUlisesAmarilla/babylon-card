/* eslint-disable no-class-assign */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as BABYLON from 'babylonjs'

import { SpriteAtlasCache } from './var-class'
import {waitForTextureReady} from './common'

export class AnimatedSprite extends BABYLON.Mesh {
  frameRate
  _frameIndex = 0
  color = BABYLON.Color3.White()
  frameBlueprints = []

  constructor(name: string, frameRate: number, scene: BABYLON.Scene) {
    super(name, scene)
    this.frameRate = frameRate
    this.buildDefaultGeometry()
  }

  get frameIndex() {
    return this._frameIndex
  }
  set frameIndex(value) {
    this._frameIndex = value
    this.applyCurrentFrameBlueprint()
  }
  get material() {
    return super.material
  }
  set material(value) {
    super.material = value
  }

  buildDefaultGeometry() {
    const positions = [
      -0.5,
      0.5,
      0,
      // top left
      -0.5,
      -0.5,
      0,
      // bottom left
      0.5,
      -0.5,
      0,
      // bottom right
      0.5,
      0.5,
      0
      // top right
    ]
    const normals = [
      0,
      0,
      1,
      // top left
      0,
      0,
      1,
      // bottom left
      0,
      0,
      1,
      // bottom right
      0,
      0,
      1
      // top right
    ]
    const indices = [
      0,
      1,
      2,
      // first triangle (top left, bottom left, bottom right)
      0,
      2,
      3
      // second triangle (top left, bottom right, top right)
    ]
    this.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions)
    this.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals)
    this.setIndices(indices)
  }
  setFrameBlueprints(frameBlueprints = []) {
    this.frameBlueprints = frameBlueprints
    const animation = new BABYLON.Animation(
      'spriteAnimation',
      'frameIndex',
      this.frameRate,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    )
    animation.setKeys(
      frameBlueprints.map((_2, index) => ({
        frame: index,
        value: index
      }))
    )
    this.animations.length = 0
    this.animations.push(animation)
  }
  applyCurrentFrameBlueprint(frameIndex = this._frameIndex) {
    const {vertices, uvCoords}: any = this.frameBlueprints[~~frameIndex]
    this.setVerticesData(BABYLON.VertexBuffer.PositionKind, vertices.flat())
    this.setVerticesData(BABYLON.VertexBuffer.UVKind, uvCoords.flat())
  }
  static fromAtlasJsonURL(jsonUrl: string, frameRate = 60, pixelsToUnitsRatio = 100, scene: BABYLON.Scene) {
    const name = jsonUrl.replace(/.*\//, '')
    const plane = new AnimatedSprite(`sprite/${name}`, frameRate, scene)
    plane.isPickable = false
    plane.material = new BABYLON.StandardMaterial(`sprite/${name}`, scene)
    plane.setEnabled(false)
    const promiseLoaded = SpriteAtlasCache.load(jsonUrl, pixelsToUnitsRatio).then(async (spriteAtlas: any) => {
      const {texture} = spriteAtlas
      await waitForTextureReady(texture)
      return spriteAtlas
    })
    promiseLoaded.then((spriteAtlas: any) => {
      scene ?? (scene = plane.getScene())
      const {frames, applySettingsToMaterial} = spriteAtlas
      applySettingsToMaterial(plane.material)
      plane.setFrameBlueprints(frames)
      plane.applyCurrentFrameBlueprint()
      plane.setEnabled(true)
    })
    let promisePlayAndDispose: any
    let promisePlayOnLoop: any
    return Object.assign(plane, {
      waitUntilLoaded: () => promiseLoaded,
      waitUntilFinished: () => promisePlayAndDispose,
      playAndDispose: async () => {
        if (promisePlayAndDispose) {
          console.warn('playAndDispose already called')
        } else {
          await promiseLoaded
          promisePlayAndDispose = promiseLoaded.then((spriteAtlas: any) => {
            scene ?? (scene = plane.getScene())
            const ani = scene.beginAnimation(plane, 0, spriteAtlas.frames.length - 1, false)
            return ani.waitAsync()
          })
          promisePlayAndDispose.then(() => plane.dispose())
        }
        return promisePlayAndDispose
      },
      playOnLoop: () => {
        if (promisePlayAndDispose) {
          console.warn('playAndDispose already called')
        } else {
          promisePlayOnLoop = promiseLoaded.then((spriteAtlas: any) => {
            scene ?? (scene = plane.getScene())
            const animatable = scene.beginAnimation(plane, 0, spriteAtlas.frames.length - 1, true)
            return animatable
          })
        }
        return promisePlayOnLoop
      },
      stopLoop: () => {
        promisePlayOnLoop == null ? void 0 : promisePlayOnLoop.then((animatable: BABYLON.Animatable) => animatable.stop())
      }
    })
  }
}