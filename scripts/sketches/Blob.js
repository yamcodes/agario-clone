import Color from 'color'
import settings from '../../settings.json'
import { score, increaseScore } from '../globals'

/** Class representing a blob. */
export class Blob {
  /**
   * Create a Blob.
   * @param  {number} sketch - Which sketch to spawn the Blob in.
   * @param  {number} x - X-axis of the Blob.
   * @param  {number} y - Y-axis of the Blob.
   * @param  {number} r - Radius of the Blob.
   * @param  {string} [color] (optional) Color of the Blob. Default to cyan.
   * @param  {boolean} [edible] (optional) Whether this Pellet is edible. Default to true.
   */
  constructor (sketch, x, y, r, color = 'cyan', edible = true) {
    this.p5 = sketch
    this.x = x
    this.y = y
    this.r = r
    this.newRadius = r
    this.color = color
    this.edible = edible
  }

  // eating function. determining if blob eats another blob
  isEating (other) {
    return this.p5.createVector(this.x, this.y).dist(this.p5.createVector(other.x, other.y)) < this.r + settings.blob.strokeSize / 2 + other.r - 2 * settings.blob.eatDistance * other.r
  }

  containing (other) {
    return this.p5.createVector(this.x, this.y).dist(this.p5.createVector(other.x, other.y)) < this.r + settings.blob.strokeSize / 2 + other.r - 2 * other.r
  }

  eat (pellet) {
    // this.r-=0.01
    // this.newRadius = this.p5.sqrt(this.r * this.r + pellet.r * pellet.r) // pi*r^2 = sum of areas
    // pellet.edible = false
    const b = this.p5.createVector(this.x, this.y)
    const p = this.p5.createVector(pellet.x, pellet.y)
    const t = p.sub(b)
    t.setMag(t.mag() - settings.blob.foodMagnetStrength)
    b.add(t)
    pellet.x = b.x
    pellet.y = b.y
    if (this.containing(pellet)) {
      pellet.alive = false
      this.newRadius = this.p5.sqrt(this.newRadius * this.newRadius + pellet.r * pellet.r) // pi*r^2 = sum of areas
      increaseScore()
      // console.log('Score', score)
      // TODO better way to get the score (as the number of pellets eaten) by the radius
      // this.r = this.p5.sqrt(this.r * this.r + pellet.r * pellet.r) // pi*r^2 = sum of areas
    }
    // pellet.alive = false
  }

  draw () {
    this.p5.fill(this.color)
    this.p5.strokeWeight(settings.blob.strokeSize)
    this.p5.stroke(Color(this.color).darken(settings.blob.strokeOpacity).hex())
    // this.r = this.newRadius
    this.r = this.p5.lerp(this.r, this.newRadius, 0.1)
    this.p5.circle(this.x, this.y, this.r * 2)
    this.p5.textSize(this.r / 3)
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER)
    this.p5.fill('white')
    this.p5.stroke('black')
    this.p5.strokeWeight(this.r/32)
    this.p5.text('yamyam263', this.x, this.y)
    this.p5.textSize(this.r / 5)
    this.p5.text(score, this.x, this.y + this.r / 2)
    /**
     * Vector representing the location of the mouse, originated at the center of the canvas.
     * @type {number}
     */
    const target = this.p5.createVector(this.p5.mouseX - this.p5.width / 2, this.p5.mouseY - this.p5.height / 2)
    const slowDownBound = 2 * this.r
    let speed = settings.blob.maxSpeed
    if (target.mag() < slowDownBound) { speed *= target.mag() / slowDownBound }
    target.setMag(speed)
    const pos = this.p5.createVector(this.x, this.y)
    pos.add(target)
    const a = -this.r / Math.sqrt(2)
    const w = settings.game.width / 2 + a
    const h = settings.game.height / 2 + a
    this.x = this.p5.constrain(pos.x, -w, w)
    this.y = this.p5.constrain(pos.y, -h, h)
  }
}

/** Class representing a pellet. */
export class Pellet extends Blob {
  /**
   * Create a Pellet.
   * @param  {number} sketch - Which sketch to spawn the Pellet in.
   * @param  {number} x - X-axis of the Pellet.
   * @param  {number} y - Y-axis of the Pellet.
   */
  constructor (sketch, x, y) {
    super(sketch, x, y, settings.pellets.radius, Pellet.getRandomColor())
    this.alive = true
    this.edible = true
  }

  draw () {
    this.p5.noStroke()
    this.p5.fill(this.color.hex())
    this.p5.circle(this.x, this.y, this.r * 2)
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
   * @param p5 - Which sketch to spawn the pellets in.
   * @param n - Number of pellets
   * @param blob - Blob of the player that eats the pellets
   */
  constructor (sketch, n, blob) {
    this.p5 = sketch
    this.n = n
    this.blob = blob
    this.pellets = []
    for (let i = 0; i < this.n; i++) {
      const x = this.p5.random(-settings.game.width / 2 + settings.pellets.radius, settings.game.width / 2 - settings.pellets.radius)
      const y = this.p5.random(-settings.game.height / 2 + settings.pellets.radius, settings.game.height / 2 - settings.pellets.radius)
      this.setPellet(i, new Pellet(this.p5, x, y))
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
          pellet.x === this.p5.constrain(pellet.x, this.blob.x - this.p5.windowWidth / this.p5.getZoom() / 2 - pellet.r, this.blob.x + this.p5.windowWidth / this.p5.getZoom() / 2 + pellet.r) &&
          pellet.y === this.p5.constrain(pellet.y, this.blob.y - this.p5.windowHeight / this.p5.getZoom() / 2 - pellet.r, this.blob.y + this.p5.windowHeight / this.p5.getZoom() / 2 + pellet.r)
        ) {
          pellet.draw()
          // console.log('this.p5.getZoom', this.p5.getZoom())
        }
        /**
         * else if (
          pellet.x === this.p5.constrain(pellet.x, this.blob.x - this.p5.windowWidth / this.p5.getZoom() / 2 - pellet.r, this.blob.x + this.p5.windowWidth / this.p5.getZoom() / 2 + pellet.r) &&
          pellet.y === this.p5.constrain(pellet.y, this.blob.y - this.p5.windowHeight / this.p5.getZoom() / 2 - pellet.r, this.blob.y + this.p5.windowHeight / this.p5.getZoom() / 2 + pellet.r)
        ) {
          pellet.draw()
          // console.log('this.p5.getZoom', this.p5.getZoom())
        } */
      }
    })
  }
}
