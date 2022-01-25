import P5 from 'p5'
import game from './scripts/sketches/game'
import { setP5 } from './scripts/globals'

// BUG: zooming messes the game up, allows you to cheat and look ahead. potential fix: render only what's on screen (100% of it)
const scene = new P5(game)
setP5(scene)
console.log(scene)

document.addEventListener('gesturestart', function (e) {
  e.preventDefault()
})
