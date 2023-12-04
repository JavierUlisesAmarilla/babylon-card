import './style.css'

import {loadScene} from './babylon'

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  loadScene()
}