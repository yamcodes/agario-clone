import p5 from './p5-instantiate';
import { Blob, Pellets } from './assets';
import settings from '../config/settings.json';
// BUG: zooming messes the game up, allows you to cheat and look ahead. potential fix: render only what's on screen (100% of it)

const blob = new Blob(0, 0, settings.blob.initialRadius, '#cf1898');
const pelletArea = p5.PI * settings.pellets.radius ** 2;
// BUG density changes with screen size, when the window is small it appears there is less density
const gameArea = settings.game.width * settings.game.height;
const numberOfPellets = (gameArea / pelletArea) * (settings.pellets.density);
const pellets = new Pellets(numberOfPellets, blob);
let zoom = 1;
let scrollZoom = (settings.game.initialZoomMode - 1) / (settings.game.numberOfZoomModes - 1);
let lerpedScrollZoom = scrollZoom;

p5.setup = () => {
  global.score = Math.round(settings.blob.initialRadius ** 2 / settings.pellets.radius ** 2);
  p5.createCanvas(p5.windowWidth, p5.windowHeight);
};

p5.draw = () => {
  p5.translate(p5.width / 2, p5.height / 2);
  lerpedScrollZoom = p5.lerp(lerpedScrollZoom, scrollZoom, 0.1);
  zoom = p5.mapZoomByView() * p5.mapZoomByScore();
  if (settings.game.maxZoom > 1) {
    zoom *= p5.map(lerpedScrollZoom, 0, 1, 1, settings.game.maxZoom);
  }
  p5.scale(zoom);
  p5.translate(-blob.x, -blob.y);
  drawBackground();
  // drawBorder()
  pellets.draw(p5);
  blob.draw(p5);
};

p5.getZoom = () => zoom;

p5.mapZoomByView = (
  desiredWidth = settings.game.viewWidth,
  desiredHeight = settings.game.viewHeight,
) => {
  const normalizedWidth = p5.windowWidth / desiredWidth;
  const normalizedHeight = p5.windowHeight / desiredHeight;
  return p5.max(normalizedWidth, normalizedHeight);
};

/** maps the zoom s.t. blob fills screen when its max sized */
p5.mapZoomByScore = () => {
  const finalRadius = Blob.getEstimatedRadius(settings.blob.maxScore);
  const closestEdge = p5.min(settings.game.viewWidth, settings.game.viewHeight);
  const factor = p5.map(
    blob.r,
    settings.blob.initialRadius,
    finalRadius,
    settings.game.minBlobZoomFactor,
    settings.game.maxBlobZoomFactor,
  );
  return (closestEdge / (2 * blob.r)) * factor;
};

p5.mouseWheel = (e) => {
  const notches = (-1) * Math.ceil(Math.abs(e.delta / 100)) * Math.sign(e.delta);
  const zoomRatio = notches / (settings.game.numberOfZoomModes - 1);
  if (settings.game.numberOfZoomModes > 1) scrollZoom = p5.constrain(scrollZoom + zoomRatio, 0, 1);
};

p5.windowResized = () => {
  p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  // p5.scale( p5.mapZoom()* p5.map(scrollZoom,0,1,1,settings.game.maxZoom));
  // p5.zoom(1920,1080);
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
