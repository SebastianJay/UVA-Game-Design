"use strict";

import { Sprite } from './Sprite';
import { Vector } from '../util/Vector';
import { GameClock } from '../util/GameClock';
import { Physics } from '../util/Physics';
import { applyMixins } from '../util/mixins';

/** Interface for publicly visible members of PhysicsSprite */
export interface IPhysicsSprite {
  mass : number;
  elasticity : number;
  acceleration : Vector;
  velocity : Vector;
  addForce : (f : Vector) => void;
}

/**
 * A Sprite that has physics properties.
 *
 * Classes applying the PhysicsSpriteBase should (1) implement IPhysicsSprite
 * (2) include the following interfaces in their class:
mass : number;
elasticity : number;
acceleration : Vector;
velocity : Vector;
addForce : (f : Vector) => void;
protected initPhysics : () => void;
protected updatePhysics : (pos : Vector) => Vector;
 * (3) execute this line after the class definition
applyMixins(ConcreteClass, [PhysicsSpriteBase,])
 */
export abstract class PhysicsSpriteBase implements IPhysicsSprite {
  mass : number;
  elasticity : number;
  acceleration : Vector;
  velocity : Vector;
  private _currentForce : Vector;
  private _physicsClock : GameClock;
  private _currentTimestamp : number;

  addForce(f : Vector) : void {
    this._currentForce = this._currentForce.add(f);
  }

  protected initPhysics() : void {
    this.mass = 1.0;
    this.elasticity = 1.0;
    this.acceleration = Vector.zero;
    this.velocity = Vector.zero;
    this._currentForce = Vector.zero;
    this._physicsClock = new GameClock();
    this._currentTimestamp = this._physicsClock.getElapsedTime();
  }

  protected updatePhysics(currentPosition : Vector) : Vector {
    var nextTimestamp = this._physicsClock.getElapsedTime();
    var deltaT = (nextTimestamp - this._currentTimestamp) / 1000;
    this.acceleration = this._currentForce.divide(this.mass);
    this.velocity = this.velocity.add(this.acceleration.multiply(deltaT));
    var position = currentPosition.add((this.velocity.multiply(deltaT))
      .add(this.acceleration.multiply(deltaT*deltaT)).multiply(Physics.PixelsPerMeter));
    this._currentForce = Vector.zero;
    this._currentTimestamp = nextTimestamp;
    return position;
  }
}

/** Finally, a concrete implementation of PhysicsSprite */
export class PhysicsSprite extends Sprite implements IPhysicsSprite {
  constructor(id : string, filename : string) {
    super(id, filename);
    this.initPhysics();
  }

  update() : void {
    super.update();
    this.position = this.updatePhysics(this.position);
  }

  mass : number;
  elasticity : number;
  acceleration : Vector;
  velocity : Vector;
  addForce : (f : Vector) => void;
  protected initPhysics : () => void;
  protected updatePhysics : (pos : Vector) => Vector;
}
applyMixins(PhysicsSprite, [PhysicsSpriteBase]);
