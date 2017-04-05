"use strict";

import { DisplayObject } from '../engine/display/DisplayObject';
import { Sprite } from '../engine/display/Sprite';
import { IRectCollider, RectColliderSpriteBase } from '../engine/display/ColliderSprite';
import { IPhysicsSprite, PhysicsSpriteBase } from '../engine/display/PhysicsSprite';
import { IAnimatedSprite, AnimatedSpriteBase } from '../engine/display/AnimatedSprite';
import { CollisionEventArgs, CollisionType } from '../engine/events/EventTypes';
import { EventDispatcher } from '../engine/events/EventDispatcher';
import { Rectangle } from '../engine/util/Rectangle';
import { Vector } from '../engine/util/Vector';
import { Physics } from '../engine/util/Physics';
import { applyMixins } from '../engine/util/mixins';

export class PlayerObject extends Sprite implements IRectCollider, IPhysicsSprite, IAnimatedSprite {
  jumpTargetSpeed : number = 14; // m/s in y-axis that jump pulls player up to
  jumpMinSpeed : number = 8;  // m/s in y-axis that cancel jump pulls player to

  moveForce : Vector = new Vector(15, 0); // force for player running right
  topSpeed : number = 15;     // cap on horizontal speed
  runningSpeed : number = 5;  // speed to be considered running to qualify for reverse deceleration
  stillSpeed : number = 0.3;  // threshold speed at which player can stop moving
  reverseFactor : number = 2; // how strongly to decelerate if reversing direction
  rampDownFactor : number = 5; // how much to scale down velocity each frame when still (friction)
  rampDownAirFactor : number = 12; // how much to scale down velocity in midair when still (drag)

  grounded : boolean;  // whether the player is on the ground
  jumping : boolean;  // whether the player is in process of jumping
  currentDirectionRight : boolean;

  constructor(id: string, filename: string) {
    super(id, filename);
    this.initPhysics();
    this.initAnimation(filename);
    this.collisionLayer = 1;
    this.isTrigger = false;
    this.elasticity = 0.0;
    this.terminalSpeeds.x = this.topSpeed;

    this.grounded = false;
    this.jumping = false;
    this.currentDirectionRight = true;
    EventDispatcher.addGlobalListener(CollisionEventArgs.ClassName, this.collisionHandler);
  }

  update() : void {
    super.update();
    this.updatePhysics();
    this.updateAnimation();
  }

  /**
   * Called when the player wants to move the player horizontally
   * Direction is negative moving left, positive moving right, or zero if no input
   */
  run(direction : number) : void {
    if (direction < -0.5) {
      this.addForce(this.moveForce.multiply(-1)
        .multiply(this.velocity.x > this.runningSpeed && this.grounded ? this.reverseFactor : 1));
      this.animate('walk_left');
      this.currentDirectionRight = false;
    } else if (direction > 0.5) {
      this.addForce(this.moveForce
        .multiply(this.velocity.x < -this.runningSpeed && this.grounded ? this.reverseFactor : 1));
      this.animate('walk');
      this.currentDirectionRight = true;
    } else {
      if (Math.abs(this.velocity.x) < this.stillSpeed) {
        // effectively moves velocity back to zero
        this.addForce(new Vector(-this.velocity.x / Physics.DeltaTime * this.mass, 0));
      } else {
        // applies a "friction" related to player velocity
        this.addForce(new Vector(-(this.velocity.x / (this.grounded ? this.rampDownFactor : this.rampDownAirFactor))
          / Physics.DeltaTime * this.mass, 0));
      }

      if (this.currentDirectionRight) {
        this.animate('idle');
      } else {
        this.animate('idle_left');
      }
    }
  }

  /**
  * Called when the player wants the player to jump
  */
  jump() : void {
    if (this.grounded) {
      // add force that would equate player's y speed to jumpTargetSpeed
      this.addForce(new Vector(0, -this.jumpTargetSpeed / Physics.DeltaTime * this.mass)
        .add(Physics.Gravity.multiply(this.mass)));
      this.jumping = true;
    }
  }

  /** Called when player releases jump button */
  cancelJump() : void {
    if (this.jumping) {
      if (this.velocity.y < -this.jumpMinSpeed) {
        // moves velocity to jumpMinSpeed
        this.addForce(new Vector(0, -(this.velocity.y + this.jumpMinSpeed) / Physics.DeltaTime * this.mass)
          .add(Physics.Gravity.multiply(this.mass)));
      }
      this.jumping = false;
    }
  }

  private get collisionHandler() {
    var self = this;
    return (args : CollisionEventArgs) => {
      if (args.obj1 === self || args.obj2 === self) {
        if ((args.type == CollisionType.Enter || args.type == CollisionType.Stay) && args.normal.y < 0) {
          this.grounded = true;
        }
        else if (args.type == CollisionType.Exit) {
          this.grounded = false;
        }
      }
    }
  }

  collisionLayer : number;
  isTrigger : boolean;
  getHitbox : () => Rectangle;

  mass : number;
  elasticity : number;
  acceleration : Vector;
  velocity : Vector;
  terminalSpeeds : Vector;
  previousPosition : Vector;
  addForce : (f : Vector) => void;
  protected initPhysics : () => void;
  protected updatePhysics : () => void;

  animate : (animId: string) => void;
  isPaused : () => boolean;
  setPaused : (b : boolean) => void;
  setGlobalSpeed : (speed: number) => void;
  getGlobalSpeed : () => number;
  protected initAnimation : (filename : string) => void;
  protected updateAnimation : () => void;
}
applyMixins(PlayerObject, [RectColliderSpriteBase, PhysicsSpriteBase, AnimatedSpriteBase]);
