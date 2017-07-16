"use strict";

import { Gate } from './Gate';
import { MainGameColor } from './MainGameEnums';
import { Switch } from './Switch';
import { CallbackManager } from '../engine/events/CallbackManager';

/**
 * A TimedGate is a type of Gate which will alternate between two positions on a timer
 * If this gate is not synced with a switch before its first update() is posted, it will start moving immediately,
 * If it is synced, then it will only go through the movement cycle when the switch is pressed.
 */
export class TimedGate extends Gate {

  private _isSynced : boolean;  // whether the gate is synced with a switch
  private _isActive : boolean;  // if synced, whether the switch is pressed to activate the gate
  private _halfCycleTime : number;  // amount of time (seconds) to wait before moving to other position
  private _halfCycleTimer : number; // temp timer to

  constructor(id : string, filename : string, halfCycleTime : number, color : MainGameColor = MainGameColor.Neutral) {
    super(id, filename, color);
    this._halfCycleTime = halfCycleTime;
    this._isSynced = false;
    this._halfCycleTimer = 0;
    this._isActive = false;
  }

  update(dt : number = 0) : void {
    super.update(dt);
    if (!this._isSynced || this._isActive) {
      this._halfCycleTimer += dt;
      if (this._halfCycleTimer > this._halfCycleTime) {
        this.moveMode = 1 - this.moveMode;
        this._halfCycleTimer = 0;
      }
    }
  }

  refreshState() : void {
    super.refreshState();
    this._halfCycleTimer = 0;
    this._isActive = false;
  }

  syncSwitch(sw : Switch) : void {
    this._isSynced = true;
    var self = this;
    sw.addOnEnter(() => {
      // starts movement
      self._isActive = true;
    });
    sw.addOnExit(() => {
      // pauses movement
      self._isActive = false;
    });
  }
}
