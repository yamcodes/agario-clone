import settings from '../../settings.json';
import Pellet from './Pellet';
import p5 from '../../testp5';
/** Class representing a group of pellets. */
export default class Pellets {
  /**
   * Create a group of pellets.
   * @param n - Number of pellets
   * @param blob - Blob of the player that eats the pellets
   */
  constructor(n, blob) {
    this.n = n;
    this.blob = blob;
    this.pellets = [];
    for (let i = 0; i < this.n; i += 1) {
      const left = -settings.game.width / 2 + settings.pellets.radius;
      const right = settings.game.width / 2 - settings.pellets.radius;
      const top = settings.game.height / 2 - settings.pellets.radius;
      const bottom = -settings.game.height / 2 + settings.pellets.radius;
      const x = p5.random(left, right);
      const y = p5.random(bottom, top);
      this.setPellet(i, new Pellet(x, y));
    }
  }

  getPellet(i) {
    return this.pellets[i];
  }

  setPellet(i, value) {
    this.pellets[i] = value;
  }

  draw() {
    this.pellets.forEach((pellet) => {
      if (pellet.alive) {
        const left = this.blob.x - p5.windowWidth / p5.getZoom() / 2 - pellet.r;
        const right = this.blob.x + p5.windowWidth / p5.getZoom() / 2 + pellet.r;
        const top = this.blob.y + p5.windowHeight / p5.getZoom() / 2 + pellet.r;
        const bottom = this.blob.y - p5.windowHeight / p5.getZoom() / 2 - pellet.r;
        if (this.blob.isEating(pellet) && pellet.edible) this.blob.eat(pellet);
        if (
          pellet.x === p5.constrain(pellet.x, left, right)
          && pellet.y === p5.constrain(pellet.y, bottom, top)
        ) pellet.draw(p5);
      }
    });
  }
}
