"use strict";

import { Sprite } from './Sprite';
import { Vector } from '../util/Vector';
import { Physics } from '../util/Physics';
import { applyMixins } from '../util/mixins';

/** Interface for publicly visible members of PhysicsSprite */
export interface IPhysicsSprite {
  mass : number;
  elasticity : number;
  acceleration : Vector;
  velocity : Vector;
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
    this.previousPosition = Vector.zero;
    this._currentForce = Vector.zero;
  }

  protected updatePhysics() : void {
    var dt = Physics.DeltaTime;
    this.previousPosition = this.position;
    this.acceleration = this._currentForce.divide(this.mass);
    this.velocity = this.velocity.add(this.acceleration.multiply(dt));
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

  update() : void {
    super.update();
    this.updatePhysics();
  }

  mass : number;
  elasticity : number;
  acceleration : Vector;
  velocity : Vector;
  previousPosition : Vector;
  addForce : (f : Vector) => void;
  protected initPhysics : () => void;
  protected updatePhysics : () => void;
}
applyMixins(PhysicsSprite, [PhysicsSpriteBase]);
