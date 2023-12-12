/* eslint-disable no-class-assign */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as BABYLON from 'babylonjs'

import {TextureCache} from './var-class'
import {waitForTextureReady} from './common'

let SpriteAtlas: any;
((SpriteAtlas2) => {
  function adaptFrameBlueprints(spriteAtlas: any, pixelsToUnits = 100) {
    const keys = Object.keys(spriteAtlas.frames)
    keys.sort()
    return keys.map((key) => {
      const cell = spriteAtlas.frames[key]
      const blueprint = createFrameMeshBlueprint(cell, spriteAtlas.meta.size, pixelsToUnits)
      return {name: key, ...blueprint}
    })
  }
  SpriteAtlas2.adaptFrameBlueprints = adaptFrameBlueprints
  function createFrameMeshBlueprint(frameData: any, atlasSize: any, pixelsToUnits: number) {
    const {frame, spriteSourceSize, sourceSize, pivot, rotated} = frameData
    function calculateUVs() {
      const u02 = frame.x / atlasSize.w
      const v02 = 1 - frame.y / atlasSize.h
      const u12 = (frame.x + frame.w) / atlasSize.w
      const v12 = 1 - (frame.y + frame.h) / atlasSize.h
      return [u02, v02, u12, v12]
    }
    const [u0, v0, u1, v1] = calculateUVs()
    function calculateVertices() {
      const scale = 1 / pixelsToUnits
      const x02 = scale * (-sourceSize.w * pivot.x + spriteSourceSize.x)
      const y02 = -scale * (-sourceSize.h * pivot.y + spriteSourceSize.y)
      const x12 = scale * (-sourceSize.w * pivot.x + spriteSourceSize.w + spriteSourceSize.x)
      const y12 = -scale * (-sourceSize.h * pivot.y + spriteSourceSize.h + spriteSourceSize.y)
      return [x02, y02, x12, y12]
    }
    const [x0, y0, x1, y1] = calculateVertices()
    return {
      vertices: [
        [x0, y0, 0],
        [x0, y1, 0],
        [x1, y1, 0],
        [x1, y0, 0]
      ],
      uvCoords: rotated ? [
        [u1, v0],
        [u0, v0],
        [u0, v1],
        [u1, v1]
      ] : [
        [u0, v0],
        [u0, v1],
        [u1, v1],
        [u1, v0]
      ]
    }
  }
  async function loadSpriteAtlasJsonData(jsonUrl: string) {
    const response = await fetch(jsonUrl)
    const spriteAtlas = await response.json()
    return spriteAtlas
  }
  SpriteAtlas2.loadSpriteAtlasJsonData = loadSpriteAtlasJsonData
})(SpriteAtlas || (SpriteAtlas = {}))

let SpriteAtlasCache: any;
((SpriteAtlasCache2) => {
  const cache = /* @__PURE__ */ new Map()
  async function load(jsonUrl: string, pixelsToUnitsRatio: number, scene: BABYLON.Scene) {
    const jsonData = await SpriteAtlas.loadSpriteAtlasJsonData(jsonUrl)
    const imageFilename = jsonData.meta.image
    const imageUrl = jsonUrl.replace(/\/[^\/]+$/, `/${imageFilename}`)
    const name2 = jsonUrl.replace(/.*\//, '')
    const frames = SpriteAtlas.adaptFrameBlueprints(jsonData, pixelsToUnitsRatio)
    const texture = TextureCache.getOrCreate(imageUrl, scene)
    texture.hasAlpha = true
    function applySettingsToMaterial(material: any) {
      material.diffuseTexture = texture
      material.opacityTexture = texture
      material.useAlphaFromDiffuseTexture = true
      material.onBindObservable.add((mesh: any) => {
        material.emissiveColor = mesh.color ?? new BABYLON.Color3(1, 1, 1)
      })
      return material
    }
    const defaultMaterial = applySettingsToMaterial(new BABYLON.StandardMaterial(`sprite-atlas/${name2}`, scene))
    return {name: name2, jsonData, frames, texture, defaultMaterial, applySettingsToMaterial}
  }
  SpriteAtlasCache2.load = load
  async function getOrLoad(jsonUrl: string, pixelsToUnitsRatio: number, scene: BABYLON.Scene) {
    let atlas = cache.get(jsonUrl)
    if (atlas) {
      const onTextureDisposed = function () {
        console.log(`🚮 Cached SpriteAtlas was disposed: ${atlas == null ? void 0 : atlas.name}`)
        cache.delete(jsonUrl)
      }
      const {texture, defaultMaterial} = atlas
      const isAlreadyDisposed = !texture.getScene() || !defaultMaterial.getScene()
      if (isAlreadyDisposed) {
        onTextureDisposed()
      } else {
        texture.onDisposeObservable.addOnce(onTextureDisposed)
        defaultMaterial.onDisposeObservable.addOnce(onTextureDisposed)
      }
    }
    if (!atlas) {
      atlas = await load(jsonUrl, pixelsToUnitsRatio, scene)
      cache.set(jsonUrl, atlas)
      console.log(`📦 Cached SpriteAtlas: ${name}`)
    }
    return atlas
  }
  SpriteAtlasCache2.getOrLoad = getOrLoad
})(SpriteAtlasCache || (SpriteAtlasCache = {}))

export class AnimatedSprite extends BABYLON.Mesh {
  frameRate
  _frameIndex = 0
  color = BABYLON.Color3.White()
  frameBlueprints = []
  static fromAtlasJsonURL: (jsonUrl: string, frameRate: number | undefined, pixelsToUnitsRatio: number | undefined, scene: BABYLON.Scene) => AnimatedSprite & {waitUntilLoaded: () => any; waitUntilFinished: () => any; playAndDispose: () => Promise<any>; playOnLoop: () => any; stopLoop: () => void;}

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
}
((AnimatedSprite2) => {
  function fromAtlasJsonURL(jsonUrl: string, frameRate = 60, pixelsToUnitsRatio = 100, scene: BABYLON.Scene) {
    const name = jsonUrl.replace(/.*\//, '')
    const plane = new AnimatedSprite2(`sprite/${name}`, frameRate, scene)
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
  AnimatedSprite2.fromAtlasJsonURL = fromAtlasJsonURL
})(AnimatedSprite || (AnimatedSprite = {}))