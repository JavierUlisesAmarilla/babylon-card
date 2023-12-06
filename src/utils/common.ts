import * as BABYLON from 'babylonjs'

export const getRandomTarget = (origin: BABYLON.Vector3, zOffset: number, range: number) => {
  const dX = Math.random() * range - range / 2
  const dY = Math.random() * range - range / 2
  const target = new BABYLON.Vector3(origin.x + dX, origin.y + dY, origin.z + zOffset)
  return target
}