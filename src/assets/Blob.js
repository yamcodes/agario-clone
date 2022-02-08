import Color from 'color';
import settings from '../../config/settings.json';
import p5 from '../p5-instantiate';

/** Class representing a blob. */
export default class Blob {
  /**
   * Create a Blob.
   * @param  {number} x - X-axis of the Blob.
   * @param  {number} y - Y-axis of the Blob.
   * @param  {number} r - Radius of the Blob.
   * @param  {Color} [color] (optional) Color of the Blob. Default to cyan.
   * @param  {boolean} [edible] (optional) Whether this Pellet is edible. Default to true.
   */
  constructor(x, y, r, color = Color('cyan'), edible = true) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.edible = edible;
  }

  draw() {
    const { strokeOpacity, strokeSize } = settings.blob;
    p5.fill(this.color.hex());
    p5.strokeWeight(strokeSize);
    p5.stroke(this.color.darken(strokeOpacity).hex());
    p5.fill(this.color.hex());
    p5.circle(this.x, this.y, this.r * 2);
  }

  static getMassByRadius(radius) {
    const area = p5.PI * radius ** 2;
    const pelletArea = p5.PI * settings.pellets.radius ** 2;
    return p5.round(area / pelletArea);
  }

  static getRadiusByMass(mass) {
    return p5.sqrt(mass) * settings.pellets.radius;
  }
}
