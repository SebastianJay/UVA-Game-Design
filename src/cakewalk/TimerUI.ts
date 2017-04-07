"use strict";

import { Sprite } from '../engine/display/Sprite';
import { GameClock } from '../engine/util/GameClock';
import { Vector } from '../engine/util/Vector';

export class TimerUI extends Sprite {

  private _totalTime : number;  // in seconds
  private _startPos : Vector; // location on screen for start of timer
  private _endPos : Vector;   // location on screen for end of timer

  private _timer : GameClock;
  private _timeElapsed : number;

  constructor(id : string, filename : string, totalTime : number, startPos : Vector, endPos : Vector) {
    super(id, filename);
    this._totalTime = totalTime;
    this._startPos = startPos;
    this._endPos = endPos;
    this._timer = new GameClock();
    this._timeElapsed = 0;
  }

  update() : void {
    super.update();
    this._timeElapsed = this._timer.getElapsedTime() / 1000;
    this.position = this._startPos.add(this._endPos.subtract(this._startPos)
      .multiply(Math.max(0.0, Math.min(1.0, this._timeElapsed / this._totalTime))));
  }

  reset() : void {
    this._timer.resetGameClock();
    this._timeElapsed = 0;
    this.position = this._startPos;
  }

  get isFinished() : boolean {
    return this._timeElapsed >= this._totalTime;
  }
}
