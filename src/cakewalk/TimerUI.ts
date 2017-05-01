"use strict";

import { Sprite } from '../engine/display/Sprite';
import { Vector } from '../engine/util/Vector';
import { IAnimatedSprite, AnimatedSpriteBase } from '../engine/display/AnimatedSprite';
import { applyMixins } from '../engine/util/mixins';

export class TimerUI extends Sprite implements IAnimatedSprite {

  private _totalTime : number;  // in seconds
  private _startPos : Vector; // location on screen for start of timer
  private _endPos : Vector;   // location on screen for end of timer

  private _timeElapsed : number;

  constructor(id : string, filename : string, totalTime : number, startPos : Vector, endPos : Vector) {
    super(id, filename);
    this.initAnimation(filename);
    this._totalTime = totalTime;
    this._startPos = startPos;
    this._endPos = endPos;
    this._timeElapsed = 0;
  }

  update(dt : number = 0) : void{
    super.update(dt);
    this.updateAnimation();
    this._timeElapsed += dt;
    this.position = this._startPos.add(this._endPos.subtract(this._startPos)
      .multiply(Math.max(0.0, Math.min(1.0, this._timeElapsed / this._totalTime))));
  }

  reset() : void {
    this._timeElapsed = 0;
    this.position = this._startPos;
  }

  get isFinished() : boolean {
    return this._timeElapsed >= this._totalTime;
  }

  set gameDuration(n : number) { this._totalTime = n; }
  get gameDuration() : number { return this._totalTime; }

  animate : (animId: string) => void;
  restartAnimation : () => void;
  isPaused : () => boolean;
  setPaused : (b : boolean) => void;
  setGlobalSpeed : (speed: number) => void;
  getGlobalSpeed : () => number;
  protected initAnimation : (filename : string) => void;
  protected updateAnimation : () => void;
}
applyMixins(TimerUI, [AnimatedSpriteBase]);
