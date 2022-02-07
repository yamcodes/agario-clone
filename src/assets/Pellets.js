import settings from '../../config/settings.json';
import Pellet from './Pellet';
import p5 from '../p5-instantiate';

/** Class representing a group of pellets. */
export default class Pellets {
  /**
   * Create a group of pellets.
   * @param {number} n - Number of pellets
   * @param {Player} player - Player that eats the pellets
   */
  constructor(n, player) {
    this.n = n;
    this.player = player;
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
        const left = this.player.x - p5.windowWidth / p5.getZoom() / 2 - pellet.r;
        const right = this.player.x + p5.windowWidth / p5.getZoom() / 2 + pellet.r;
        const top = this.player.y + p5.windowHeight / p5.getZoom() / 2 + pellet.r;
        const bottom = this.player.y - p5.windowHeight / p5.getZoom() / 2 - pellet.r;
        if (this.player.eats(pellet) && pellet.edible) this.player.eat(pellet);
        if (
          pellet.x === p5.constrain(pellet.x, left, right)
          && pellet.y === p5.constrain(pellet.y, bottom, top)
        ) pellet.draw();
      }
    });
  }
}
