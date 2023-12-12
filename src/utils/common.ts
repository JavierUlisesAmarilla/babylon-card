import * as BABYLON from 'babylonjs'

export const getRandomTarget = (origin: BABYLON.Vector3, zOffset: number, range: number) => {
  const dX = Math.random() * range - range / 2
  const dY = Math.random() * range - range / 2
  const target = new BABYLON.Vector3(origin.x + dX, origin.y + dY, origin.z + zOffset)
  return target
}

export const getLookQuat = (origin: BABYLON.Vector3, target: BABYLON.Vector3) => {
  const lookAt = BABYLON.Matrix.LookAtLH(origin, target, BABYLON.Vector3.Up()).invert()
  return BABYLON.Quaternion.FromRotationMatrix(lookAt)
}

export const generateRandomString = (len: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i2 = 0; i2 < len; i2++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }
  return result
}

export const waitForTextureReady = (texture: BABYLON.Texture) => {
  return new Promise((resolve) => {
    if (texture.isReady()) {
      resolve(true)
    } else {
      texture.onLoadObservable.addOnce(() => resolve(true))
    }
  })
}

export const delay = (s: number) => {
  if (s <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, s * 1e3))
}