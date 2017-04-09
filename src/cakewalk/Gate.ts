"use strict";

import { Platform } from './Platform';
import { Switch } from './Switch';
import { MainGameColor } from './MainGameEnums';
import { PlayerObject } from './PlayerObject';
import { Vector } from '../engine/util/Vector';
import { ArrayList } from '../engine/util/ArrayList';
import { CollisionEventArgs, CollisionType } from '../engine/events/EventTypes';
import { EventDispatcher } from '../engine/events/EventDispatcher';

/**
 * A gate is synced with a switch to have a resting position and target when switch is pressed
 */
export class Gate extends Platform {

  private _restPosition : Vector;
  private _targetPosition : Vector;
  private _moveMode : number;
  private _playersOnGate : ArrayList<PlayerObject>;  // list of players that are on top of gate
  private _smoothFactor : number = 0.05;
  private _closeDistance : number = 0.05;

  constructor(id : string, filename : string, color : MainGameColor = MainGameColor.Neutral) {
    super(id, filename, color);
    this._restPosition = this._targetPosition = this.position;
    this._moveMode = 0;
    this._playersOnGate = new ArrayList<PlayerObject>();
    EventDispatcher.addGlobalListener(CollisionEventArgs.ClassName, this.collisionHandler);
  }

  get restPosition() : Vector { return this._restPosition; }
  set restPosition(v : Vector) { this._restPosition = v; }
  get targetPosition() : Vector { return this._targetPosition; }
  set targetPosition(v : Vector) { this._targetPosition = v; }

  update() : void {
    super.update();
    var deltaPos = Vector.zero;
    var destPos = this._moveMode == 0 ? this.restPosition : this.targetPosition;
    if (!this.position.equals(destPos)) {
      // if gate is close enough to dest, go straight there, otherwise move by smooth interpolated amount
      var isCloseToDest = this.position.subtract(destPos).lengthSquared() <= this._closeDistance*this._closeDistance;
      deltaPos = destPos.subtract(this.position).multiply(isCloseToDest ? 1 : this._smoothFactor);
    }

    // update gate position as well as any players standing on top of the gate
    this.position = this.position.add(deltaPos);
    for (var i = 0; i < this._playersOnGate.length; i++) {
      // NOTE since we modify PhysicsObject position directly we also change previousPosition so physics updates work
      // this is hacky since we are overwriting history, but not doing this prevents player from running on moving gate
      this._playersOnGate.get(i).position = this._playersOnGate.get(i).position.add(deltaPos);
      this._playersOnGate.get(i).previousPosition = this._playersOnGate.get(i).previousPosition.add(deltaPos);
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

  private get collisionHandler() {
    var self = this;
    return (args : CollisionEventArgs) => {
      // keep account of which players are on top, so they can move with the gate as it moves
      if ((args.obj1 === self || args.obj2 === self)
        && (args.obj1 instanceof PlayerObject || args.obj2 instanceof PlayerObject)) {
        var player = ((args.obj1 instanceof PlayerObject) ? args.obj1 : args.obj2) as PlayerObject;
        if (args.type == CollisionType.Enter && args.normal.y < 0 && !this._playersOnGate.contains(player)) {
          this._playersOnGate.add(player);
        } else if (args.type == CollisionType.Exit && this._playersOnGate.contains(player)) {
          this._playersOnGate.remove(player);
        }
      }
    }
  }
}
