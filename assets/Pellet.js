import Color from 'color';
import settings from '../settings.json';
import Blob from './Blob';
import p5 from '../p5-instantiate';

/** Class representing a pellet. */
export default class Pellet extends Blob {
  /**
   * Create a Pellet.
   * @param  {number} x - X-axis of the Pellet.
   * @param  {number} y - Y-axis of the Pellet.
   */
  constructor(x, y) {
    super(x, y, settings.pellets.radius, Pellet.getRandomColor());
    this.alive = true;
    this.edible = true;
  }

  draw() {
    p5.noStroke();
    p5.fill(this.color.hex());
    p5.circle(this.x, this.y, this.r * 2);
  }

  /**
   * Get a random light Color.
   * @param {number} [lighten] (Optional) How light should the random color be. 0 means don't lighten (Default), 1 means lighten all the way.
   * @return {Color} A light color.
   */
  static getRandomColor(lighten = 0) {
    if (lighten < 0 || lighten > 1) throw new RangeError('lighten must be between 0 and 1.');
    const r = 256 - Number(Math.random() * 256 * (1 - lighten));
    const g = 256 - Number(Math.random() * 256 * (1 - lighten));
    const b = 256 - Number(Math.random() * 256 * (1 - lighten));
    return Color.rgb([r, g, b]);
  }
}
