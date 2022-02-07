// import Color from 'color';
import settings from '../../config/settings.json';
import Blob from './Blob';
import p5 from '../p5-instantiate';

/** Class representing a Food. */
export default class Food {
  /**
   * Create food.
   * @param {Player} player - Player that eats the food
   */
  constructor(player) {
    this.food = [];
    this.player = player;
  }

  draw() {
    this.food.forEach((food) => {
      if (food.alive) {
        if (!this.player.intersecting(food)) food.edible = true;
        const left = this.player.x - p5.windowWidth / p5.getZoom() / 2 - food.r;
        const right = this.player.x + p5.windowWidth / p5.getZoom() / 2 + food.r;
        const top = this.player.y + p5.windowHeight / p5.getZoom() / 2 + food.r;
        const bottom = this.player.y - p5.windowHeight / p5.getZoom() / 2 - food.r;
        if (this.player.isEating(food) && food.edible) {
          this.player.eat(food);
        }
        if (
          food.x === p5.constrain(food.x, left, right)
        && food.y === p5.constrain(food.y, bottom, top)
        && food.alive
        ) {
          const foodVect = p5.createVector(food.x, food.y);
          const trajectory = food.mouse;
          if (!this.player.containing(food)) {
            food.speed = p5.lerp(0, food.speed, settings.food.deceleration);
          }
          trajectory.setMag(food.speed);
          foodVect.add(trajectory);
          food.x = foodVect.x;
          food.y = foodVect.y;
          food.draw();
        }
      }
    });
  }

  add(x, y, color) {
    const mouse = p5.createVector(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2);
    const food = new Blob(x, y, settings.food.radius, color, false);
    food.alive = true;
    food.millis = p5.millis();
    food.speed = settings.food.speed;
    food.mouse = mouse;
    this.food.push(food);
  }
}
