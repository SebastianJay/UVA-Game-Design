"use strict";

/**
 * Basic Vector class
 * Adapted from https://evanw.github.io/lightgl.js/docs/vector.html
 */
export class Vector {
  x : number;
  y : number;
  z : number;
  constructor (x : number, y : number, z? : number) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  negative() : Vector {
    return new Vector(-this.x, -this.y, -this.z);
  };

  add(v : Vector) : Vector {
    return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
  };

  subtract(v : Vector) : Vector {
    return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
  };

  multiply(v : Vector | number) : Vector {
    if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
    else return new Vector(this.x * v, this.y * v, this.z * v);
  };

  divide(v : Vector | number) : Vector {
    if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
    else return new Vector(this.x / v, this.y / v, this.z / v);
  };

  equals(v : Vector) : boolean {
    return this.x == v.x && this.y == v.y && this.z == v.z;
  };

  dot(v : Vector) : number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  };

  cross(v : Vector): Vector {
    return new Vector(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  };

  length() : number {
    return Math.sqrt(this.dot(this));
  };

  unit() : Vector {
    return this.divide(this.length());
  };

  min() : number {
    return Math.min(Math.min(this.x, this.y), this.z);
  };

  max() : number {
    return Math.max(Math.max(this.x, this.y), this.z);
  };

  toAngles() : any {
    return {
      theta: Math.atan2(this.z, this.x),
      phi: Math.asin(this.y / this.length())
    };
  };

  angleTo(a : Vector) : number {
    return Math.acos(this.dot(a) / (this.length() * a.length()));
  };

  rotate(cwRadians : number) : Vector {
    return new Vector(Math.cos(cwRadians) * this.x - Math.sin(cwRadians) * this.y,
      Math.sin(cwRadians) * this.x + Math.cos(cwRadians) * this.y);
  };

  toArray(n? : number): number[] {
    return [this.x, this.y, this.z].slice(0, n || 3);
  };

  clone() : Vector {
    return new Vector(this.x, this.y, this.z);
  };

  init(x : number, y : number, z? : number) : Vector {
    this.x = x; this.y = y; this.z = z;
    return this;
  };
}
