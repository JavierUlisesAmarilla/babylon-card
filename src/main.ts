import './style.css'

import {loadBabylon} from './babylon'

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  loadBabylon()
}