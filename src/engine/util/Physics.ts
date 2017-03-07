"use strict";

import { Vector } from './Vector';

export class Physics {
  static GravityScalar : number = 9.81; // m / s^2
  static Gravity : Vector = new Vector(0, Physics.GravityScalar); // positive y is down onscreen
  static PixelsPerMeter : number = 10;
}
