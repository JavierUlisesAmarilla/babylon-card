import * as BABYLON from 'babylonjs'

import {AnimatedSprite} from './animated-sprite'

export const dustCool = (scene: BABYLON.Scene) => {
  const JSON1 = 'https://undroop-assets.web.app/confucius/rtfx-pngquant/fx/smoke-004-hit-explosion-radial-noct-norsz.json'
  const sprite = AnimatedSprite.fromAtlasJsonURL(JSON1, 30, 25, scene)
  return sprite
}