import Color from 'color';
import p5 from './p5-instantiate';
import {
  Pellets, Food, Player, Blob,
} from './assets';
import settings from '../config/settings.json';
// BUG: zooming messes the game up, allows you to cheat and look ahead. potential fix: render only what's on screen (100% of it)
let { color } = settings.player;
if (settings.player.randomColor) {
  color = p5.random(['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']);
}
const player = new Player(0, 0, settings.player.initialRadius, Color(color));
const pelletArea = p5.PI * settings.pellets.radius ** 2;
// BUG density changes with screen size, when the window is small it appears there is less density
const gameArea = settings.game.width * settings.game.height;
const numberOfPellets = (gameArea / pelletArea) * (settings.pellets.density);
const pellets = new Pellets(numberOfPellets, player);
const food = new Food(player);
let zoom = 1;
let scrollZoom = (settings.game.initialZoomMode - 1) / (settings.game.numberOfZoomModes - 1);
let lerpedScrollZoom = scrollZoom;

p5.setup = () => p5.createCanvas(p5.windowWidth, p5.windowHeight);

p5.draw = () => {
  p5.translate(p5.width / 2, p5.height / 2);
  lerpedScrollZoom = p5.lerp(lerpedScrollZoom, scrollZoom, 0.1);
  zoom = p5.mapZoomByView() * p5.mapZoomByMass();
  if (settings.game.maxZoom > 1) {
    zoom *= p5.map(lerpedScrollZoom, 0, 1, 1, settings.game.maxZoom);
  }
  p5.scale(zoom);
  p5.translate(-player.x, -player.y);
  drawBackground();
  // drawBorder()
  pellets.draw();
  food.draw();
  player.draw();
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

/** maps the zoom s.t. player fills screen when it reached max mass */
p5.mapZoomByMass = () => {
  const finalRadius = Player.getRadiusByMass(settings.player.maxMass);
  const closestEdge = p5.min(settings.game.viewWidth, settings.game.viewHeight);
  const f = (x) => p5.sqrt(x);
  const factor = p5.map(
    f(player.r),
    f(settings.player.initialRadius),
    f(finalRadius),
    settings.game.initialPlayerZoomFactor,
    settings.game.finalPlayerZoomFactor,
  );
  return (closestEdge / (2 * player.r)) * factor;
};

p5.mouseWheel = (e) => {
  const notches = (-1) * p5.ceil(p5.abs(e.delta / 100)) * Math.sign(e.delta);
  const zoomRatio = notches / (settings.game.numberOfZoomModes - 1);
  if (settings.game.numberOfZoomModes > 1) scrollZoom = p5.constrain(scrollZoom + zoomRatio, 0, 1);
};

p5.windowResized = () => {
  p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  // p5.scale( p5.mapZoom()* p5.map(scrollZoom,0,1,1,settings.game.maxZoom));
  // p5.zoom(1920,1080);
};

p5.keyTyped = () => {
  if (p5.keyCode === 32) { // space
    // console.log('Split!');
  }
  if (p5.keyCode === 87) { // w
    const foodMass = Blob.getMassByRadius(settings.food.radius);
    const mouse = p5.createVector(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2);
    const foodVect = p5.createVector(player.x, player.y);
    mouse.setMag(player.r - settings.food.radius);
    foodVect.add(mouse);
    if (player.reduceMass(foodMass)) food.add(foodVect.x, foodVect.y, player.color);
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
