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

export const showPath3D = (path3d: BABYLON.Path3D, size?: number) => {
  size = size || 0.5
  const curve = path3d.getCurve()
  const points = path3d.getPoints()
  const tangents = path3d.getTangents()
  const normals = path3d.getNormals()
  const binormals = path3d.getBinormals()
  let lineTangents, lineNormals, lineBinormals
  const lineCurve = BABYLON.CreateLines('lineCurve', {points})
  lineCurve.color = BABYLON.Color3.Yellow()

  for (let i = 0; i < curve.length; i++) {
    lineTangents = BABYLON.CreateLines('lineTangents' + i, {points: [curve[i], curve[i].add(tangents[i].scale(size))]})
    lineNormals = BABYLON.CreateLines('lineNormals' + i, {points: [curve[i], curve[i].add(normals[i].scale(size))]})
    lineBinormals = BABYLON.CreateLines('lineBinormals' + i, {points: [curve[i], curve[i].add(binormals[i].scale(size))]})
    lineTangents.color = BABYLON.Color3.Red()
    lineNormals.color = BABYLON.Color3.Green()
    lineBinormals.color = BABYLON.Color3.Blue()
  }
}