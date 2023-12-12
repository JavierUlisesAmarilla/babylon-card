/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-escape */
import {Color3, ITextureCreationOptions, Nullable, Scene, StandardMaterial, Texture, ThinEngine} from 'babylonjs'

export let TextureCache: any = {};
((TextureCache2: any) => {
  const textureCache: any = {}
  function getOrCreate(url: string, sceneOrEngine?: Nullable<Scene | ThinEngine>, noMipmapOrOptions?: boolean | ITextureCreationOptions, invertY?: boolean, samplingMode?: number, onLoad?: Nullable<() => void>, onError?: Nullable<(message?: string, exception?: any) => void>, buffer?: Nullable<string | ArrayBuffer | ArrayBufferView | HTMLImageElement | Blob | ImageBitmap>, deleteBuffer?: boolean, format?: number, mimeType?: string, loaderOptions?: any, creationFlags?: number, forcedExtension?: string) {
    let texture = textureCache[url]
    if (!texture) {
      texture = new Texture(url, sceneOrEngine, noMipmapOrOptions, invertY, samplingMode, onLoad, onError, buffer, deleteBuffer, format, mimeType, loaderOptions, creationFlags, forcedExtension)
      const nameFromTextureURL = (url.match(/([^\/]+)(?=\.\w+$)/) || [])[1] || 'nameless'
      texture.name = nameFromTextureURL
      textureCache[url] = texture
      texture.onDisposeObservable.addOnce(() => clearTexture(url))
    }
    return texture
  }
  TextureCache2.getOrCreate = getOrCreate
  function getOrCreateWithSuffix(url: string, keySuffix = '', scene: Nullable<Scene | ThinEngine>) {
    const textureKey = url + keySuffix
    let texture = textureCache[textureKey]
    if (!texture) {
      texture = new Texture(url, scene)
      textureCache[textureKey] = texture
      texture.onDisposeObservable.addOnce(() => clearTexture(textureKey))
    }
    return texture
  }
  TextureCache2.getOrCreateWithSuffix = getOrCreateWithSuffix
  function clearTexture(key: string) {
    if (textureCache[key]) {
      textureCache[key].dispose()
      delete textureCache[key]
    }
  }
  TextureCache2.clearTexture = clearTexture
})(TextureCache || (TextureCache = {}))

export let CachedStandardMaterials: any = {};
((CachedStandardMaterials2: any) => {
  CachedStandardMaterials2.disableCache = true
  const materialCache: any = {}
  function getMaterial(textureUrl: string, scene: Scene | undefined) {
    if (!CachedStandardMaterials2.disableCache) {
      if (materialCache[textureUrl]) {
        return materialCache[textureUrl]
      }
    }
    const nameFromTextureURL = (textureUrl.match(/([^\/]+)(?=\.\w+$)/) || [])[1] || 'nameless'
    const material = new StandardMaterial(nameFromTextureURL, scene)
    if (textureUrl !== '') {
      const texture = TextureCache.getOrCreate(textureUrl, scene)
      material.diffuseTexture = texture
      material.opacityTexture = texture
    }
    material.emissiveColor = Color3.White()
    materialCache[textureUrl] = material
    return material
  }
  CachedStandardMaterials2.getMaterial = getMaterial
  function clearMaterial(textureUrl: string) {
    if (materialCache[textureUrl]) {
      materialCache[textureUrl].dispose()
      delete materialCache[textureUrl]
    }
  }
  CachedStandardMaterials2.clearMaterial = clearMaterial
})(CachedStandardMaterials || (CachedStandardMaterials = {}))

export let SpriteAtlas: any;
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

export let SpriteAtlasCache: any;
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
    }
    return atlas
  }
  SpriteAtlasCache2.getOrLoad = getOrLoad
})(SpriteAtlasCache || (SpriteAtlasCache = {}))