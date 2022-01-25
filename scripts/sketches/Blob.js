import Color from 'color'
import settings from '../../settings.json'
import { p5, score, increaseScore } from '../globals'

/** Class representing a blob. */
export class Blob {
  /**
   * Create a Blob.
   * @param  {number} x - X-axis of the Blob.
   * @param  {number} y - Y-axis of the Blob.
   * @param  {number} r - Radius of the Blob.
   * @param  {string} [color] (optional) Color of the Blob. Default to cyan.
   * @param  {boolean} [edible] (optional) Whether this Pellet is edible. Default to true.
   */
  constructor (x, y, r, color = 'cyan', edible = true) {
    this.x = x
    this.y = y
    this.r = r
    this.newRadius = r
    this.color = color
    this.edible = edible
  }

  // eating function. determining if blob eats another blob
  isEating (other) {
    return p5.createVector(this.x, this.y).dist(p5.createVector(other.x, other.y)) < this.r + settings.blob.strokeSize / 2 + other.r - 2 * settings.blob.eatDistance * other.r
  }

  containing (other) {
    return p5.createVector(this.x, this.y).dist(p5.createVector(other.x, other.y)) < this.r + settings.blob.strokeSize / 2 + other.r - 2 * other.r
  }

  eat (pellet) {
    // this.r-=0.01
    // this.newRadius = p5.sqrt(this.r * this.r + pellet.r * pellet.r) // pi*r^2 = sum of areas
    // pellet.edible = false
    const b = p5.createVector(this.x, this.y)
    const p = p5.createVector(pellet.x, pellet.y)
    const t = p.sub(b)
    t.setMag(t.mag() - settings.blob.foodMagnetStrength)
    b.add(t)
    pellet.x = b.x
    pellet.y = b.y
    if (this.containing(pellet)) {
      pellet.alive = false
      this.newRadius = p5.sqrt(this.newRadius * this.newRadius + pellet.r * pellet.r) // pi*r^2 = sum of areas
      increaseScore()
      // console.log('Score', score)
      // TODO better way to get the score (as the number of pellets eaten) by the radius
      // this.r = p5.sqrt(this.r * this.r + pellet.r * pellet.r) // pi*r^2 = sum of areas
    }
    // pellet.alive = false
  }

  shootFireBall (fireballs, targetX, targetY, speed) {
    const direction = p5.createVector(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2)
    fireballs.shoot(this, direction, speed)
    // console.log(p5test)
  }

  draw () {
    p5.fill(this.color)
    p5.strokeWeight(settings.blob.strokeSize)
    p5.stroke(Color(this.color).darken(settings.blob.strokeOpacity).hex())
    // this.r = this.newRadius
    this.r = p5.lerp(this.r, this.newRadius, 0.1)
    p5.circle(this.x, this.y, this.r * 2)
    p5.textSize(this.r / 3)
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.fill('white')
    p5.stroke('black')
    p5.strokeWeight(this.r / 32)
    p5.text('yamyam263', this.x, this.y)
    p5.textSize(this.r / 5)
    p5.text(score, this.x, this.y + this.r / 2)
    /**
     * Vector representing the location of the mouse, originated at the center of the canvas.
     * @type {number}
     */
    const target = p5.createVector(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2)
    const slowDownBound = 2 * this.r
    let speed = settings.blob.maxSpeed
    if (target.mag() < slowDownBound) speed *= target.mag() / slowDownBound
    target.setMag(speed)
    const pos = p5.createVector(this.x, this.y)
    pos.add(target)
    const a = -this.r / Math.sqrt(2)
    const w = settings.game.width / 2 + a
    const h = settings.game.height / 2 + a
    this.x = p5.constrain(pos.x, -w, w)
    this.y = p5.constrain(pos.y, -h, h)
  }
}

/** Class representing a pellet. */
export class Pellet extends Blob {
  /**
   * Create a Pellet.
   * @param  {number} x - X-axis of the Pellet.
   * @param  {number} y - Y-axis of the Pellet.
   */
  constructor (x, y) {
    super(x, y, settings.pellets.radius, Pellet.getRandomColor(1))
    this.alive = true
    this.edible = true
  }

  draw () {
    p5.noStroke()
    p5.fill(this.color.hex())
    p5.circle(this.x, this.y, this.r * 2)
  };

  /**
   * Get a random light Color.
   * @param {number} [lighten] (Optional) How light should the random color be. 0 means don't lighten (Default), 1 means lighten all the way.
   * @return {Color} A light color.
   */
  static getRandomColor (lighten = 0) {
    if (lighten < 0 || lighten > 1) throw new RangeError('lighten must be between 0 and 1.')
    const r = 256 - Number(Math.random() * 256 * (1 - lighten))
    const g = 256 - Number(Math.random() * 256 * (1 - lighten))
    const b = 256 - Number(Math.random() * 256 * (1 - lighten))
    return Color.rgb([r, g, b])
  }
}

/** Class representing a group of pellets. */
export class Pellets {
  /**
   * Create a group of pellets.
   * @param n - Number of pellets
   * @param blob - Blob of the player that eats the pellets
   */
  constructor (n, blob) {
    this.n = n
    this.blob = blob
    this.pellets = []
    for (let i = 0; i < this.n; i++) {
      const x = p5.random(-settings.game.width / 2 + settings.pellets.radius, settings.game.width / 2 - settings.pellets.radius)
      const y = p5.random(-settings.game.height / 2 + settings.pellets.radius, settings.game.height / 2 - settings.pellets.radius)
      this.setPellet(i, new Pellet(x, y))
    }
  }

  getPellet (i) {
    return this.pellets[i]
  }

  setPellet (i, value) {
    this.pellets[i] = value
  }

  draw () {
    this.pellets.forEach(pellet => {
      if (pellet.alive) {
        if (this.blob.isEating(pellet) && pellet.edible) {
          this.blob.eat(pellet)
        }
        if (
          pellet.x === p5.constrain(pellet.x, this.blob.x - p5.windowWidth / p5.getZoom() / 2 - pellet.r, this.blob.x + p5.windowWidth / p5.getZoom() / 2 + pellet.r) &&
          pellet.y === p5.constrain(pellet.y, this.blob.y - p5.windowHeight / p5.getZoom() / 2 - pellet.r, this.blob.y + p5.windowHeight / p5.getZoom() / 2 + pellet.r)
        ) {
          pellet.draw()
          // console.log('p5.getZoom', p5.getZoom())
        }
        /**
         * else if (
          pellet.x === p5.constrain(pellet.x, this.blob.x - p5.windowWidth / p5.getZoom() / 2 - pellet.r, this.blob.x + p5.windowWidth / p5.getZoom() / 2 + pellet.r) &&
          pellet.y === p5.constrain(pellet.y, this.blob.y - p5.windowHeight / p5.getZoom() / 2 - pellet.r, this.blob.y + p5.windowHeight / p5.getZoom() / 2 + pellet.r)
        ) {
          pellet.draw()
          // console.log('p5.getZoom', p5.getZoom())
        } */
      }
    })
  }
}

/** Class representing a fireball. */
export class Fireball extends Blob {
  /**
   * Create a Pellet.
   * @param  {number} x - X-axis of the Fireball.
   * @param  {number} y - Y-axis of the Fireball.
   * @param  {number} direction - Direction of the Fireball.
   * @param  {number} speed - Speed of the Fireball.
   */
  constructor (x, y, direction, speed) {
    super(x, y, settings.fireball.radius, Fireball.getColor())
    this.direction = direction
    this.speed = speed
    this.newSpeed = speed
    // this.alive = true
    // this.edible = true
  }

  draw () {
    p5.noStroke()
    p5.fill(this.color.hex())
    p5.circle(this.x, this.y, this.r * 2)
    const loc = p5.createVector(this.x, this.y)
    const travel = p5.createVector(this.direction.x, this.direction.y)
    //   this.speed = p5.lerp(this.speed, settings.fireball.speed * 5, 0.01)
    travel.setMag(this.speed)
    const res = loc.add(travel)
    this.x = res.x
    this.y = res.y
  };

  /**
   * Get a random light Color.
   * @param {number} [lighten] (Optional) How light should the random color be. 0 means don't lighten (Default), 1 means lighten all the way.
   * @return {Color} A light color.
   */
  static getColor () {
    // if (lighten < 0 || lighten > 1) throw new RangeError('lighten must be between 0 and 1.')
    // const r = 256 - Number(Math.random() * 256 * (1 - lighten))
    // const g = 256 - Number(Math.random() * 256 * (1 - lighten))
    // const b = 256 - Number(Math.random() * 256 * (1 - lighten))
    return Color.rgb([200, 0, 100])
  }
}
export class Fireballs {
  /**
   * Create a group of pellets.
   * @param n - Number of fireballs
   * @param blob - Blob of the player that shoots the fireballs
   */
  constructor (n, blob) {
    this.n = 0
    this.blob = blob
    this.fireballs = []
    // for (let i = 0; i < this.n; i++) {
    //   this.setFireball(i, new Fireball(p5, blob.x, blob.y))
    // }
  }

  shoot (blob, direction, speed) {
    this.n++
    this.setFireball(this.n - 1, new Fireball(blob.x, blob.y, direction, speed))
  }

  getFireball (i) {
    return this.fireballs[i]
  }

  setFireball (i, value) {
    this.fireballs[i] = value
  }

  draw () {
    this.fireballs.forEach(fireball => {
      fireball.draw()
    })
  }
}
