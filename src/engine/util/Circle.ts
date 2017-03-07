"use strict";

import { Vector } from './Vector';

export class Circle {
  constructor(public center: Vector,
  public radius : number) {
  }

  get area() : number { return this.radius * this.radius * Math.PI; }
  get perimeter() : number { return this.radius * 2 * Math.PI; }
  get circumference() : number { return this.perimeter; }
  get diameter() : number { return this.radius * 2; }
}
