"use strict";

import { Sprite } from './Sprite';
import { Vector } from '../util/Vector';
import { Physics } from '../util/Physics';
import { TweenManager } from '../tween/TweenManager';
import { applyMixins } from '../util/mixins';

/** Interface for publicly visible members of PhysicsSprite */
export interface IPhysicsSprite {
  mass : number;
  elasticity : number;
  acceleration : Vector;
  velocity : Vector;
  terminalSpeeds : Vector;
  previousPosition : Vector;
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
terminalSpeeds : Vector;
previousPosition : Vector;
addForce : (f : Vector) => void;
protected initPhysics : () => void;
protected updatePhysics : () => void;
 * (3) execute this line after the class definition
applyMixins(ConcreteClass, [PhysicsSpriteBase,])
 */
export abstract class PhysicsSpriteBase extends Sprite implements IPhysicsSprite {
  mass : number;
  elasticity : number;
  acceleration : Vector;
  velocity : Vector;
  terminalSpeeds : Vector;  // set of speeds on each axis that sprite cannot exceed
  previousPosition : Vector;
  private _currentForce : Vector;

  addForce(f : Vector) : void {
    this._currentForce = this._currentForce.add(f);
  }

  protected initPhysics() : void {
    this.mass = 1.0;
    this.elasticity = 0.0;
    this.acceleration = Vector.zero;
    this.velocity = Vector.zero;
    this.terminalSpeeds = Vector.zero;  // if zero, no cap
    this.previousPosition = Vector.zero;
    this._currentForce = Vector.zero;
  }

  protected updatePhysics() : void {
    this.previousPosition = this.position;
    if (TweenManager.instance.isTweening(this)) {
      return; // do nothing further than note previous position
    }
    var dt = Physics.DeltaTime;
    this.acceleration = this._currentForce.divide(this.mass);
    this.velocity = this.velocity.add(this.acceleration.multiply(dt));
    if (this.terminalSpeeds.x != 0 && Math.abs(this.velocity.x) > this.terminalSpeeds.x) {
      this.velocity.x = (this.velocity.x < 0 ? -1 : 1) * this.terminalSpeeds.x;
    }
    if (this.terminalSpeeds.y != 0 && Math.abs(this.velocity.y) > this.terminalSpeeds.y) {
      this.velocity.y = (this.velocity.y < 0 ? -1 : 1) * this.terminalSpeeds.y;
    }
    this.position = this.position.add((this.velocity.multiply(dt))
      .add(this.acceleration.multiply(dt*dt)).multiply(Physics.PixelsPerMeter));
    this._currentForce = Vector.zero;
  }
}

/** Finally, a concrete implementation of PhysicsSprite */
export class PhysicsSprite extends Sprite implements IPhysicsSprite {
  constructor(id : string, filename : string) {
    super(id, filename);
    this.initPhysics();
  }

  update(dt : number = 0) : void{
    super.update(dt);
    this.updatePhysics();
  }

  mass : number;
  elasticity : number;
  acceleration : Vector;
  velocity : Vector;
  terminalSpeeds : Vector;
  previousPosition : Vector;
  addForce : (f : Vector) => void;
  protected initPhysics : () => void;
  protected updatePhysics : () => void;
}
applyMixins(PhysicsSprite, [PhysicsSpriteBase]);
