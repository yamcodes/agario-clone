import Color from 'color';
import settings from '../settings.json';
import p5 from '../p5-instantiate';
/** Class representing a blob. */
export default class Blob {
  /**
   * Create a Blob.
   * @param  {number} x - X-axis of the Blob.
   * @param  {number} y - Y-axis of the Blob.
   * @param  {number} r - Radius of the Blob.
   * @param  {string} [color] (optional) Color of the Blob. Default to cyan.
   * @param  {boolean} [edible] (optional) Whether this Pellet is edible. Default to true.
   */
  constructor(x, y, r, color = 'cyan', edible = true) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.newRadius = r;
    this.color = color;
    this.edible = edible;
  }

  // eating function. determining if blob eats another blob
  isEating(other) {
    const blobDistance = p5.createVector(this.x, this.y).dist(p5.createVector(other.x, other.y));
    const blobRadii = this.r + settings.blob.strokeSize / 2 + other.r;
    return blobDistance < blobRadii - 2 * settings.blob.eatDistance * other.r;
  }

  containing(other) {
    const blobDistance = p5.createVector(this.x, this.y).dist(p5.createVector(other.x, other.y));
    return blobDistance < this.r + settings.blob.strokeSize / 2 + other.r - 2 * other.r;
  }

  eat(pellet) {
    // this.r-=0.01
    // this.newRadius = p5.sqrt(this.r * this.r + pellet.r * pellet.r) // pi*r^2 = sum of areas
    // pellet.edible = false
    const b = p5.createVector(this.x, this.y);
    const p = p5.createVector(pellet.x, pellet.y);
    const t = p.sub(b);
    t.setMag(t.mag() - settings.blob.foodMagnetStrength);
    b.add(t);
    pellet.x = b.x;
    pellet.y = b.y;
    if (this.containing(pellet)) {
      pellet.alive = false;
      this.newRadius = p5.sqrt(this.newRadius * this.newRadius + pellet.r * pellet.r); // pi*r^2 = sum of areas
      global.score += 1;
      // console.log('Score', score)
      // TODO better way to get the score (as the number of pellets eaten) by the radius
      // this.r = p5.sqrt(this.r * this.r + pellet.r * pellet.r) // pi*r^2 = sum of areas
    }
    // pellet.alive = false
  }

  draw() {
    p5.fill(this.color);
    p5.strokeWeight(settings.blob.strokeSize);
    p5.stroke(Color(this.color).darken(settings.blob.strokeOpacity).hex());
    // this.r = this.newRadius
    this.r = p5.lerp(this.r, this.newRadius, 0.1);
    p5.circle(this.x, this.y, this.r * 2);
    p5.textSize(this.r / 3);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.fill('white');
    p5.stroke('black');
    p5.strokeWeight(this.r / 32);
    p5.text('yamyam263', this.x, this.y);
    p5.textSize(this.r / 5);
    p5.text(global.score, this.x, this.y + this.r / 2);
    /**
     * Vector representing the location of the mouse, originated at the center of the canvas.
     * @type {number}
     */
    const target = p5.createVector(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2);
    const slowDownBound = 2 * this.r;
    let speed = settings.blob.maxSpeed;
    if (target.mag() < slowDownBound) { speed *= target.mag() / slowDownBound; }
    target.setMag(speed);
    const pos = p5.createVector(this.x, this.y);
    pos.add(target);
    const a = -this.r / Math.sqrt(2);
    const w = settings.game.width / 2 + a;
    const h = settings.game.height / 2 + a;
    this.x = p5.constrain(pos.x, -w, w);
    this.y = p5.constrain(pos.y, -h, h);
  }
}
