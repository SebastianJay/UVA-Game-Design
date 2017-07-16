"use strict";

import { Platform } from './Platform';
import { Switch } from './Switch';
import { MainGameColor } from './MainGameEnums';
import { PlayerObject } from './PlayerObject';
import { Vector } from '../engine/util/Vector';
import { ArrayList } from '../engine/util/ArrayList';
import { CollisionEventArgs, CollisionType } from '../engine/events/EventTypes';
import { EventDispatcher } from '../engine/events/EventDispatcher';
import { IRefreshable } from './MainGameSprite';

/**
 * A gate is synced with a switch to have a resting position and target when switch is pressed
 */
export class Gate extends Platform implements IRefreshable {

  private _restPosition : Vector;
  private _targetPosition : Vector;
  private _moveMode : number;
  private _playersOnGate : ArrayList<PlayerObject>; // list of players that are on top of gate
  private _playersOnSide : ArrayList<PlayerObject>; // list of players getting pushed by gate
  private _smoothFactor : number = 0.05;
  private _closeDistance : number = 0.05;

  constructor(id : string, filename : string, color : MainGameColor = MainGameColor.Neutral) {
    super(id, filename, color);
    this._restPosition = this._targetPosition = this.position;
    this._moveMode = 0;
    this._playersOnGate = new ArrayList<PlayerObject>();
    this._playersOnSide = new ArrayList<PlayerObject>();
    EventDispatcher.addGlobalListener(CollisionEventArgs.ClassName, this.collisionHandler);
  }

  get restPosition() : Vector { return this._restPosition; }
  set restPosition(v : Vector) { this._restPosition = v; }
  get targetPosition() : Vector { return this._targetPosition; }
  set targetPosition(v : Vector) { this._targetPosition = v; }
  get smoothFactor() : number { return this._smoothFactor; }
  set smoothFactor(f : number) { this._smoothFactor = f; }

  update(dt : number = 0) : void {
    super.update(dt);
    var deltaPos = Vector.zero;
    var destPos = this.moveMode == 0 ? this.restPosition : this.targetPosition;
    if (!this.position.equals(destPos)) {
      // if gate is close enough to dest, go straight there, otherwise move by smooth interpolated amount
      var isCloseToDest = this.position.subtract(destPos).lengthSquared() <= this._closeDistance*this._closeDistance;
      deltaPos = destPos.subtract(this.position).multiply(isCloseToDest ? 1 : this._smoothFactor);
    }

    // update gate position as well as any players standing on top of the gate
    this.position = this.position.add(deltaPos);
    for (var i = 0; i < this._playersOnGate.length; i++) {
      var player = this._playersOnGate.get(i);
      // NOTE since we modify PhysicsObject position directly we also change previousPosition so physics updates work
      // this is hacky since we are overwriting history, but not doing this prevents player from running on moving gate
      player.position = player.position.add(deltaPos);
      player.previousPosition = player.previousPosition.add(deltaPos);
    }
    for (var i = 0; i < this._playersOnSide.length; i++) {
      var player = this._playersOnSide.get(i);
      var collides = false;
      if (this.collidesWith(player)) {
        player.position = player.position.add(deltaPos);
        player.previousPosition = player.previousPosition.add(deltaPos);
        collides = true;
      }
      if (!collides) {
        this._playersOnSide.removeAt(i);
        i--;  // length decreases, so we want to at same index for next element
      }
    }
  }

  refreshState() : void {
    this.position = this.restPosition;
    this._moveMode = 0;
    this._playersOnGate = new ArrayList<PlayerObject>();
    this._playersOnSide = new ArrayList<PlayerObject>();
  }

  syncSwitch(sw : Switch) : void {
    var self = this;
    sw.addOnEnter(() => {
      self.moveMode = 1;
    });
    sw.addOnExit(() => {
      self.moveMode = 0;
    });
  }

  protected get moveMode() : number { return this._moveMode; }
  protected set moveMode(m : number) { this._moveMode = m; }

  private get collisionHandler() {
    var self = this;
    return (args : CollisionEventArgs) => {
      // keep account of which players are on top, so they can move with the gate as it moves
      if ((args.obj1 === self || args.obj2 === self)
        && (args.obj1 instanceof PlayerObject || args.obj2 instanceof PlayerObject)) {
        var player = ((args.obj1 instanceof PlayerObject) ? args.obj1 : args.obj2) as PlayerObject;
        if (args.type == CollisionType.Enter) {
          if (args.normal.y < 0 && !this._playersOnGate.contains(player)) {
            this._playersOnGate.add(player);
          } else if (this.isMovingInDir(args.normal) && !this._playersOnSide.contains(player)) {
            this._playersOnSide.add(player);
          }
        } else if (args.type == CollisionType.Exit && this._playersOnGate.contains(player)) {
          this._playersOnGate.remove(player);
        }
      }
    }
  }

  // tells whether the gate is moving in the direction given by the param
  private isMovingInDir(dir : Vector) {
    var dp = this.moveMode == 0 ? (this.restPosition.subtract(this.targetPosition)) : (this.targetPosition.subtract(this.restPosition));
    return (dir.x == 0 || dir.x * dp.x > 0) && (dir.y == 0 || dir.y * dp.y > 0);
  }
}
