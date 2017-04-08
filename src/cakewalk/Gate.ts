"use strict";

import { Platform } from './Platform';
import { Switch } from './Switch';
import { MainGameColor } from './MainGameEnums';
import { Vector } from '../engine/util/Vector';

/**
 * A gate is synced with a switch to have a resting position and target when switch is pressed
 */
export class Gate extends Platform {

  private _restPosition : Vector;
  private _targetPosition : Vector;
  private _moveMode : number;
  private _smoothFactor : number = 0.05;

  constructor(id : string, filename : string, color : MainGameColor = MainGameColor.Neutral) {
    super(id, filename, color);
    this._restPosition = this._targetPosition = this.position;
    this._moveMode = 0;
  }

  get restPosition() : Vector { return this._restPosition; }
  set restPosition(v : Vector) { this._restPosition = v; }
  get targetPosition() : Vector { return this._targetPosition; }
  set targetPosition(v : Vector) { this._targetPosition = v; }

  update() : void {
    super.update();
    if (this._moveMode == 0) {
      this.position = this.position.add(this.restPosition.subtract(this.position).multiply(this._smoothFactor));
    } else if (this._moveMode == 1) {
      this.position = this.position.add(this.targetPosition.subtract(this.position).multiply(this._smoothFactor));
    }
  }

  syncSwitch(sw : Switch) : void {
    var self = this;
    sw.onEnter = () => {
      self._moveMode = 1;
    };
    sw.onExit = () => {
      self._moveMode = 0;
    };
  }
}
