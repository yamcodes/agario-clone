import settings from '../settings.json'

export let score = Math.round(settings.blob.initialRadius ** 2 / settings.pellets.radius ** 2)
export function increaseScore () {
  score++
}
