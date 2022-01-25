import settings from '../settings.json'

export let score = Math.round(settings.blob.initialRadius ** 2 / settings.pellets.radius ** 2)
export function increaseScore () {
  score++
}

export let p5
export function setP5 (sketch) {
  p5 = sketch
}
