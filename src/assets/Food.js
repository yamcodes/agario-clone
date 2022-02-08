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
        if (!this.player.intersects(food)) food.edible = true;
        const left = this.player.x - p5.windowWidth / p5.getZoom() / 2 - food.r;
        const right = this.player.x + p5.windowWidth / p5.getZoom() / 2 + food.r;
        const top = this.player.y + p5.windowHeight / p5.getZoom() / 2 + food.r;
        const bottom = this.player.y - p5.windowHeight / p5.getZoom() / 2 - food.r;
        if (this.player.eats(food) && food.edible) {
          this.player.eat(food);
        }
        if (
          food.x === p5.constrain(food.x, left, right)
        && food.y === p5.constrain(food.y, bottom, top)
        && food.alive
        ) {
          if (!this.player.eats(food)) {
            food.speed = p5.lerp(0, food.speed, settings.food.deceleration);
          }
          const trajectory = food.mouse;
          const foodVect = p5.createVector(food.x, food.y);
          trajectory.setMag(food.speed);
          foodVect.add(trajectory);
          const a = -food.r / p5.sqrt(2);
          const w = settings.game.width / 2 + a;
          const h = settings.game.height / 2 + a;
          if (foodVect.x !== p5.constrain(foodVect.x, -w, w)) {
            food.mouse.x *= -1;
            food.edible = true;
          }
          if (foodVect.y !== p5.constrain(foodVect.y, -h, h)) {
            food.mouse.y *= -1;
            food.edible = true;
          }

          food.x = p5.constrain(foodVect.x, -w, w);
          food.y = p5.constrain(foodVect.y, -h, h);
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
