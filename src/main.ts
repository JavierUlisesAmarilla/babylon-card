import './style.css'

import {loadScene} from './firstScene'

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  app.innerHTML = `
    <canvas id="renderCanvas" touch-action="none"></canvas>
  `
  loadScene()
}