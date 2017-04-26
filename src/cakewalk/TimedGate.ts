"use strict";

import { Gate } from './Gate';
import { MainGameColor } from './MainGameEnums';
import { Switch } from './Switch';
import { CallbackManager } from '../engine/events/CallbackManager';

/**
 * A TimedGate is a type of Gate which will alternate between two positions on a timer
 * If this gate is not synced with a switch before its first update() is posted, it will start moving immediately,
 * If it is synced, then it will start its movement cycle once the switch is pressed.
 */
export class TimedGate extends Gate {

  private _isSynced : boolean;
  private _isStarted : boolean;
  private _halfCycleTime : number;  // amount of time (seconds) to wait before moving to other position

  constructor(id : string, filename : string, halfCycleTime : number, color : MainGameColor = MainGameColor.Neutral) {
    super(id, filename, color);
    this._halfCycleTime = halfCycleTime;
    this._isSynced = false;
    this._isStarted = false;
  }

  update(dt : number = 0) : void {
    super.update(dt);
    if (!this._isSynced && !this._isStarted) {
      this.makeMove();
    }
  }

  syncSwitch(sw : Switch) : void {
    this._isSynced = true;
    var self = this;
    sw.addOnEnter(() => {
      if (!self._isStarted) {
        self.makeMove();
      }
    });
  }

  private makeMove() {
    this._isStarted = true;
    this.moveMode = 1 - this.moveMode;
    var self = this;
    CallbackManager.instance.addCallback(() => {
      self.makeMove();
    }, this._halfCycleTime);
  }
}
