/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-escape */
import {Color3, Engine, ITextureCreationOptions, MeshBuilder, Nullable, Scene, ShaderMaterial, StandardMaterial, Texture, ThinEngine, TransformNode, Vector3} from 'babylonjs'

let TextureCache: any = {};
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

let CachedStandardMaterials: any = {};
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

function generateRandomString(len: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i2 = 0; i2 < len; i2++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }
  return result
}

function waitForTextureReady(texture: Texture) {
  return new Promise((resolve) => {
    if (texture.isReady()) {
      resolve(true)
    } else {
      texture.onLoadObservable.addOnce(() => resolve(true))
    }
  })
}

function createPlane3D(textureURL: string, mods: any = null, size = 1) {
  mods ?? (mods = {})
  const name2 = mods.name ?? generateRandomString(12)
  const mesh = Object.assign(MeshBuilder.CreatePlane(name2, {width: 1, height: 1, size}), {color: Color3.White()})
  mesh.renderingGroupId = 1
  mesh.isPickable = false
  const material = mods.material ?? CachedStandardMaterials.getMaterial(textureURL ?? '')
  mesh.material = material
  function applyTextureSizeToGeometry(texture: Texture, scaleMultiplier = 1) {
    let _a
    texture ?? (texture = material.diffuseTexture)
    if (!texture.isReady()) {
      texture.onLoadObservable.addOnce((readyTexture) => applyTextureSizeToGeometry(readyTexture, scaleMultiplier))
      return new Promise((resolve) => texture.onLoadObservable.addOnce(() => resolve(true)))
    }
    const layerTextureSize = texture.getSize()
    const width = scaleMultiplier * layerTextureSize.width * 0.01
    const height = scaleMultiplier * layerTextureSize.height * 0.01
    const newPlane = MeshBuilder.CreatePlane(`${name2}_new`, {width, height})
    mesh._geometry = newPlane.geometry
    newPlane._geometry = null
    newPlane.dispose();
    (_a = mesh._geometry) == null ? void 0 : _a.applyToMesh(mesh)
    mesh.updateFacetData()
    mesh.refreshBoundingInfo()
    return
  }
  function setTextureUrl(textureURL2: string) {
    const material2 = CachedStandardMaterials.getMaterial(textureURL2)
    const texture = material2.diffuseTexture
    mesh.material = material2
    applyTextureSizeToGeometry(texture)
    return texture
  }
  if (textureURL) {
    setTextureUrl(textureURL)
  }
  function setAdditiveBlendMode(enabled = true) {
    if (enabled) {
      material.alphaMode = Engine.ALPHA_ADD
    } else {
      material.alphaMode = Engine.ALPHA_COMBINE
    }
  }
  function setTwoSided(enabled: boolean) {
    material.backFaceCulling = !enabled
  }
  return Object.assign(
    mesh,
    {
      setTwoSided,
      setAdditiveBlendMode,
      setTextureUrl,
      setTintColor(color2: string | Color3) {
        if (typeof color2 === 'string') {
          color2 = Color3.FromHexString(color2)
        }
        mesh.color = color2
        const material2: any = mesh.material
        if (material2) {
          material2.emissiveColor = color2
        }
      },
      applyTextureSizeToGeometry,
      material,
      waitUntilTextureLoaded() {
        const texture = material.diffuseTexture
        if (!texture) {
          console.warn('No diffuse texture')
          return Promise.resolve()
        }
        return waitForTextureReady(texture)
      }
    },
    mods
  )
}

function createPlasmaGlowMaterial(scene: Scene, hexColor: string) {
  const vert = `
    attribute vec3 position;
    attribute vec2 uv;
    attribute vec4 color;
    
    uniform mat4 worldViewProjection;
  
    varying vec2 vUV;
    varying vec4 vColor;
  
    void main(void) {
      gl_Position = worldViewProjection * vec4(position, 1.0);
      vUV = uv;
      vColor = color;
    }
    `
  const frag = `
    precision mediump float;
  
    uniform sampler2D baseTexture;
    uniform sampler2D noiseTexture;
    uniform vec4 color;
    uniform vec3 speed;
    uniform float time;
    uniform float alpha;
    uniform float intensity;
  
    varying vec2 vUV;
  
    void main(void) {
      vec2 uv1 = vec2(vUV.x + 0.005 * sin(vUV.y * 10.0 + time * 3.0), vUV.y);
      vec2 uv2 = vec2(vUV.x + 0.015 * sin(vUV.y * 20.0 + time * 3.0), vUV.y);
      vec2 uv3 = vec2(vUV.x + 0.025 * sin(vUV.y * 30.0 + time * 3.0), vUV.y);
      float noise1 = texture2D(noiseTexture, uv1 * 0.1 + vec2(0.02 * time, speed.x * time)).r;
      float noise2 = texture2D(noiseTexture, uv2 * 0.2 + vec2(-0.02 * time, speed.y * time)).g;
      float noise3 = texture2D(noiseTexture, uv3 * 0.3 + vec2(0.5, speed.z * time)).b;
      float noise = noise1 * noise2 * noise3 * noise3;
      vec4 baseColor = texture2D(baseTexture, vUV);
      gl_FragColor = color * baseColor * baseColor * noise * intensity * alpha;
    }
    `
  const shaderMaterial = new ShaderMaterial(
    'plasmaMaterial',
    scene,
    {
      vertexSource: vert,
      fragmentSource: frag
    },
    {
      attributes: ['position', 'uv'],
      uniforms: ['worldViewProjection', 'alpha'],
      needAlphaBlending: true
    }
  )
  const baseTexture = TextureCache.getOrCreate('assets/images/plasma/glow2.webp', scene)
  const noiseTexture = TextureCache.getOrCreate('assets/images/plasma/glow-mask1.webp', scene)
  shaderMaterial.setTexture('baseTexture', baseTexture)
  shaderMaterial.setTexture('noiseTexture', noiseTexture)
  shaderMaterial.setColor4('color', Color3.FromHexString(hexColor).toColor4())
  shaderMaterial.setVector3('speed', new Vector3(0.09, 0.06, 0.03).scale(-1))
  shaderMaterial.setFloat('intensity', 150)
  shaderMaterial.alphaMode = Engine.ALPHA_ADD
  const randomTimeOffset = Math.random() * 1e3
  const oef = () => shaderMaterial.setFloat('time', randomTimeOffset + performance.now() * 1e-3)
  scene.registerBeforeRender(oef)
  shaderMaterial.onDisposeObservable.add(() => scene.unregisterBeforeRender(oef))
  shaderMaterial.onBindObservable.add((mesh) => shaderMaterial.setFloat('alpha', mesh.visibility))
  return Object.assign(shaderMaterial, {baseTexture, noiseTexture})
}

export function addGhostlyGlowSpriteTo(parent: TransformNode, hexColor: string) {
  const sprite = createPlane3D('assets/images/plasma/glow1.webp', {name: 'glow', parent})
  const material = createPlasmaGlowMaterial(parent.getScene(), hexColor)
  sprite.material = material
  sprite.applyTextureSizeToGeometry(material.baseTexture)
  let _color = Color3.FromHexString(hexColor)
  return Object.defineProperties(sprite, {
    material: {value: sprite.material},
    baseTexture: {value: material.baseTexture},
    noiseTexture: {value: material.noiseTexture},
    colorHex: {
      set(value) {
        _color = Color3.FromHexString(value)
        material.setColor4('color', _color.toColor4())
      },
      get() {
        return _color.toHexString()
      }
    }
  })
}