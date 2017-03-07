"use strict";

import { Vector } from './Vector';

export class Rectangle {
  private constructor(private _left : number,
    private _right : number,
    private _top : number,
    private _bottom : number) {
  }

  /** Rectangles must be constructed through static methods */
  static fromBounds(l : number, r : number, t : number, b : number) : Rectangle {
    return new Rectangle(l, r, t, b);
  }
  static fromPoints(topLeftPoint : Vector, bottomRightPoint : Vector) : Rectangle {
    return new Rectangle(topLeftPoint.x, bottomRightPoint.x, topLeftPoint.y, bottomRightPoint.y);
  }
  static fromPointDim(topLeftPoint : Vector, width : number, height : number) : Rectangle {
    return new Rectangle(topLeftPoint.x, topLeftPoint.x + width, topLeftPoint.y, topLeftPoint.y + height);
  }

  get left() : number { return this._left; }
  get right() : number { return this._right; }
  get top() : number { return this._top; }
  get bottom() : number { return this._bottom; }
  get topLeftPoint() : Vector { return new Vector(this._left, this._top); }
  get topRightPoint() : Vector { return new Vector(this._right, this._top); }
  get bottomLeftPoint() : Vector { return new Vector(this._left, this._bottom); }
  get bottomRightPoint() : Vector { return new Vector(this._right, this._bottom); }
  get centerPoint() : Vector { return new Vector(this._left + this.width / 2, this._top + this.height / 2); }
  get width() : number { return this._right - this._left; }
  get height() : number { return this._bottom - this._top; }

  get area() : number { return this.width * this.height; }
  get perimeter() : number { return this.width * 2 + this.height * 2; }
}
