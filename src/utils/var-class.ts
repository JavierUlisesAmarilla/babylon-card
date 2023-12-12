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