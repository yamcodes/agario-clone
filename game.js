import p5 from './p5-instantiate';
import { Blob, Pellets } from './scripts/assets';
import settings from './settings.json';
// BUG: zooming messes the game up, allows you to cheat and look ahead. potential fix: render only what's on screen (100% of it)

let blob;
let pellets;
let zoom = 1;
let scrollZoom = (settings.game.initialZoomMode - 1) / (settings.game.numberOfZoomModes - 1);

p5.setup = () => {
  global.score = Math.round(settings.blob.initialRadius ** 2 / settings.pellets.radius ** 2);
  p5.createCanvas(p5.windowWidth, p5.windowHeight);
  blob = new Blob(0, 0, settings.blob.initialRadius, '#cf1898');
  // BUG density changes with screen size, when the window is small it appears there is less density
  const gameArea = settings.game.width * settings.game.height;
  const pelletArea = p5.PI * settings.pellets.radius ** 2;
  const numberOfPellets = (gameArea / pelletArea) * (settings.pellets.density);
  pellets = new Pellets(numberOfPellets, blob);
};

p5.draw = () => {
  p5.translate(p5.width / 2, p5.height / 2);
  let newzoom = (settings.blob.initialRadius / blob.r) * (1 + scrollZoom);
  newzoom += p5.max((0.5 - settings.blob.initialRadius / blob.r), 0);
  // console.log(newzoom);

  // making the transition animations smoother lerp function
  zoom = p5.lerp(zoom, newzoom, 0.1);
  p5.scale(zoom);
  p5.translate(-blob.x, -blob.y);
  drawBackground();
  // drawBorder()
  pellets.draw(p5);
  blob.draw(p5);
  // p5.stroke('pink')
};
p5.getZoom = () => zoom;
p5.mouseWheel = (e) => {
  const notches = (-1) * Math.ceil(Math.abs(e.delta / 100)) * Math.sign(e.delta);
  if (settings.game.numberOfZoomModes > 1) {
    scrollZoom = p5.constrain(scrollZoom + notches / (settings.game.numberOfZoomModes - 1), 0, 1);
  }
};

p5.windowResized = () => {
  p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
};

p5.keyTyped = () => {
  if (p5.key === ' ') {
    console.log('Split!');
  }
  if (p5.key === 'w') {
    console.log('Feed!');
  }
};

function drawBackground() {
  p5.background(settings.game.bgcolor);
  p5.stroke(settings.game.gridColor);
  p5.strokeWeight(settings.game.gridStrokeSize);
  // TODO optimize to only show necessary lines according to screen view, just like pellets.
  const factor = 3; // 0.5 is exact
  const w = settings.game.width * factor;
  const h = settings.game.height * factor;
  for (let x = -w; x < w; x += settings.game.gridSize) {
    p5.line(x, -settings.game.height * factor, x, settings.game.height * factor);
  } // vertical lines
  for (let y = -h; y < h; y += settings.game.gridSize) {
    p5.line(-settings.game.width * factor, y, settings.game.width * factor, y); // horizontal lines
  }
}

// function drawBorder() {
//   p5.stroke(settings.game.gridColor);
//   p5.strokeWeight(settings.game.gridStrokeSize);
//   const w = settings.game.width / 2;
//   const h = settings.game.height / 2;
//   p5.line(-w, -h, -w, h);
//   p5.line(-w, -h, w, -h);
//   p5.line(-w, h, w, h);
//   p5.line(w, -h, w, h);
// }

document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});
