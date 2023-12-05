import {Experience} from './Experience/Experience'

export const loadBabylon = () => {
  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement

  if (!canvas) {
    return
  }

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const experience = new Experience()
  experience.init(canvas)
}