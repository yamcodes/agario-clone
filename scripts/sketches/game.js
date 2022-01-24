import settings from '../../settings.json'
import { Blob, Pellets } from './Blob'

const game = p5 => {
  let blob
  let pellets
  let zoom = 1
  let scrollZoom = (settings.game.initialZoomMode - 1) / (settings.game.numberOfZoomModes - 1)
  p5.setup = _ => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    blob = new Blob(p5, 0, 0, settings.blob.initialRadius, '#cf1898')
    const numberOfPellets = (p5.windowWidth * p5.windowHeight) / (settings.pellets.radius * settings.pellets.radius) * (settings.pellets.density)
    pellets = new Pellets(p5, numberOfPellets, blob)
  }

  p5.draw = _ => {
    p5.translate(p5.width / 2, p5.height / 2)
    let newzoom = (settings.blob.initialRadius / blob.r) * (1 + scrollZoom)
    newzoom += p5.max((0.5 - settings.blob.initialRadius / blob.r), 0)
    // console.log(newzoom);

    // making the transition animations smoother lerp function
    zoom = p5.lerp(zoom, newzoom, 0.1)
    p5.scale(zoom)
    p5.translate(-blob.x, -blob.y)
    drawBackground()
    // drawBorder()
    pellets.draw()
    blob.draw()
    // p5.stroke('pink')
  }
  p5.getZoom = _ => {
    return zoom
  }
  p5.mouseWheel = e => {
    const notches = (-1) * Math.ceil(Math.abs(e.delta / 100)) * Math.sign(e.delta)
    if (settings.game.numberOfZoomModes > 1) scrollZoom = p5.constrain(scrollZoom + notches / (settings.game.numberOfZoomModes - 1), 0, 1)
  }

  p5.windowResized = _ => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
  }

  p5.keyTyped = _ => {
    if (p5.key === ' ') {
      console.log('Split!')
    }
    if (p5.key === 'w') {
      console.log('Feed!')
    }
  }

  const drawBackground = () => {
    p5.background(settings.game.bgcolor)
    p5.stroke(settings.game.gridColor)
    p5.strokeWeight(settings.game.gridStrokeSize)
    // TODO optimize to only show neccessary lines according to screen view, just like pellets.
    const factor = 3 // 0.5 is exact
    for (let x = -settings.game.width * factor; x < settings.game.width * factor; x += settings.game.gridSize) p5.line(x, -settings.game.height * factor, x, settings.game.height * factor) // vertical lines
    for (let y = -settings.game.height * factor; y < settings.game.height * factor; y += settings.game.gridSize) p5.line(-settings.game.width * factor, y, settings.game.width * factor, y) // horizontal lines
  }

  const drawBorder = () => {
    p5.stroke(settings.game.gridColor)
    p5.strokeWeight(settings.game.gridStrokeSize)
    p5.line(-settings.game.width / 2, -settings.game.height / 2, -settings.game.width / 2, settings.game.height / 2)
    p5.line(-settings.game.width / 2, -settings.game.height / 2, settings.game.width / 2, -settings.game.height / 2)
    p5.line(-settings.game.width / 2, settings.game.height / 2, settings.game.width / 2, settings.game.height / 2)
    p5.line(settings.game.width / 2, -settings.game.height / 2, settings.game.width / 2, settings.game.height / 2)
  }
}
export default game
