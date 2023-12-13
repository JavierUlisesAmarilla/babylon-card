import * as BABYLON from 'babylonjs'

import {AnimatedSprite} from './animated-sprite'
import {GAP} from './constants'

export const dustCool = (scene: BABYLON.Scene) => {
  const sprite = AnimatedSprite.fromAtlasJsonURL('https://undroop-assets.web.app/confucius/rtfx-pngquant/fx/smoke-004-hit-explosion-radial-noct-norsz.json', 30, 25, scene)
  sprite.scaling.setAll(0.1)
  sprite.visibility = 0.05
  return sprite
}

export const lightCrawl = (scene: BABYLON.Scene, isFront = true) => {
  const sprite = AnimatedSprite.fromAtlasJsonURL('https://undroop-assets.web.app/confucius/rtfx-pngquant/fx/electricity-044-charge-radial-noct-norsz.json', 45, 34, scene)
  
  if (isFront) {
    sprite.position.x = 0.05
    sprite.position.y = 0.05
    sprite.position.z = -GAP
  } else {
    sprite.position.x = -0.05
    sprite.position.y = 0.05
    sprite.position.z = GAP
    sprite.rotation.y = Math.PI
  }

  sprite.scaling.set(0.07, 0.09, 0.07)

  if (sprite.material) {
    sprite.material.alphaMode = BABYLON.Engine.ALPHA_ADD
  }

  return sprite
}

export const explodeCombat = (scene: BABYLON.Scene) => {
  const sprite = AnimatedSprite.fromAtlasJsonURL('https://undroop-assets.web.app/confucius/rtfx-pngquant/fx/explosion-011-hit-radial-noct-norsz.json', 30, undefined, scene)
  sprite.position.z = -GAP
  sprite.scaling.setAll(0.5)
  return sprite
}