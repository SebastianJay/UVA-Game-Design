"use strict";

/**
 * Attributes of the object can get modified through the tween
 */
export enum TweenAttributeType {
  X,
  Y,
  ScaleX,
  ScaleY,
  Rotation,
  Alpha,
}

/**
 * Functions of time that can determine at what rate progress is made
 */
export enum TweenFunctionType {
  Linear,
  Quadratic
}

/**
 * A struct for tween type, its start and destination values, and how long it should take
 */
export class TweenParam {
  constructor(private _type : TweenAttributeType,
    private _startVal : number,
    private _endVal : number,
    private _duration : number,
    private _function : TweenFunctionType) {}

  get type() : TweenAttributeType { return this._type; }
  get startVal() : number { return this._startVal; }
  get endVal() : number { return this._endVal; }
  get duration() : number { return this._duration; }
  get function() : TweenFunctionType { return this._function; }
}
