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
import { applyMixins } from '../engine/util/mixins';

export class PlayerObject extends Sprite implements IRectCollider, IPhysicsSprite, IAnimatedSprite {
  jumpForce : Vector = new Vector(0, -500);
  moveForce : Vector = new Vector(30, 0);
  grounded : boolean;
  currentDirectionRight : boolean;

  constructor(id: string, filename: string) {
    super(id, filename);
    this.initPhysics();
    this.initAnimation(filename);
    this.collisionLayer = 1;
    this.isTrigger = false;
    this.elasticity = 0.0;
    this.grounded = false;
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
    if (direction < 0) {
      this.addForce(this.moveForce.multiply(-1));
      this.animate('walk_left');
      this.currentDirectionRight = false;
    } else if (direction > 0) {
      this.addForce(this.moveForce);
      this.animate('walk');
      this.currentDirectionRight = true;
    } else {
      if (this.currentDirectionRight) {
        this.animate('idle');
      } else {
        this.animate('idle_left');
      }
    }
  }

  /** Called when the player wants the player to jump */
  jump() : void {
    if (this.grounded) {
      this.addForce(this.jumpForce);
    }
  }

  private get collisionHandler() {
    var self = this;
    return (args : CollisionEventArgs) => {
      if (DisplayObject.getById(args.obj1) === self || DisplayObject.getById(args.obj2) === self) {
        if (args.type == CollisionType.Enter) {
          console.log(args.normal);
        }
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
