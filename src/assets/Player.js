import settings from '../../config/settings.json';
import Blob from './Blob';
import p5 from '../p5-instantiate';

/** Class representing a Player. */
export default class Player extends Blob {
  /**
   * Create a Blob.
   * @param  {number} x - X-axis of the Blob.
   * @param  {number} y - Y-axis of the Blob.
   * @param  {number} r - Radius of the Blob.
   * @param  {string} [color] (optional) Color of the Blob. Default to cyan.
   * @param  {boolean} [edible] (optional) Whether this Pellet is edible. Default to true.
   */
  constructor(x, y, r, color, edible) {
    super(x, y, r, color, edible);
    this.newRadius = r;
    const initialMass = p5.round(Blob.getMassByRadius(settings.player.initialRadius));
    this.mass = initialMass;
  }

  eat(blob) {
    // this.r-=0.01
    // this.newRadius = p5.sqrt(this.r * this.r + pellet.r * pellet.r) // pi*r^2 = sum of areas
    // pellet.edible = false
    const b = p5.createVector(this.x, this.y);
    const p = p5.createVector(blob.x, blob.y);
    const t = p.sub(b);
    t.setMag(t.mag() - settings.player.foodMagnetStrength);
    b.add(t);
    blob.x = b.x;
    blob.y = b.y;
    if (this.contains(blob) && this.mass < settings.player.maxMass) {
      blob.alive = false;
      this.mass += Blob.getMassByRadius(blob.r);
    }
    // pellet.alive = false
  }

  draw() {
    super.draw();
    const {
      initialSpeed, finalSpeed, initialRadius, maxMass,
    } = settings.player;
    p5.fill(this.color.hex());
    // this.r = this.newRadius
    const newRadius = Player.getRadiusByMass(this.mass);
    this.r = p5.lerp(this.r, newRadius, 0.1);
    p5.circle(this.x, this.y, this.r * 2);
    p5.textSize(this.r / 3);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.fill('white');
    p5.stroke('black');
    p5.strokeWeight(this.r / 32);
    p5.text(settings.game.username, this.x, this.y);
    p5.textSize(this.r / 5);
    p5.text(Player.getMassByRadius(this.r), this.x, this.y + this.r / 2);
    /**
     * Vector representing the location of the mouse, originated at the center of the canvas.
     * @type {number}
     */
    const target = p5.createVector(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2);
    const slowDownBound = this.r * p5.getZoom();
    const finalRadius = Player.getMassByRadius(maxMass);
    let speed = p5.map(this.r, initialRadius, finalRadius, initialSpeed, finalSpeed);
    if (target.mag() < slowDownBound) speed *= target.mag() / slowDownBound;
    target.setMag(speed);
    const pos = p5.createVector(this.x, this.y);
    pos.add(target);
    const a = -this.r / p5.sqrt(2);
    const w = settings.game.width / 2 + a;
    const h = settings.game.height / 2 + a;
    this.x = p5.constrain(pos.x, -w, w);
    this.y = p5.constrain(pos.y, -h, h);
  }

  // eating function. determining if player eats another blob
  eats(other) {
    if (other.r >= this.r) return false;
    const blobDistance = p5.createVector(this.x, this.y).dist(p5.createVector(other.x, other.y));
    const blobRadii = this.r + settings.blob.strokeSize / 2 + other.r;
    return blobDistance < blobRadii - 2 * settings.player.eatDistance * other.r;
  }

  contains(other) {
    const blobDistance = p5.createVector(this.x, this.y).dist(p5.createVector(other.x, other.y));
    return blobDistance < this.r + settings.blob.strokeSize / 2 - other.r;
  }

  intersects(other) {
    const blobDistance = p5.createVector(this.x, this.y).dist(p5.createVector(other.x, other.y));
    return blobDistance < this.r + settings.blob.strokeSize / 2 + other.r;
  }

  reduceMass(m) {
    const foodMass = Player.getMassByRadius(settings.food.radius);
    const newMass = this.mass - m;
    if (newMass > foodMass) {
      this.mass = newMass;
      return true;
    }
    return false;
  }
}
