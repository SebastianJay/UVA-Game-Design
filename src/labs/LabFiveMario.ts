"use strict";

import { Sprite } from '../engine/display/Sprite';
import { IRectCollider, RectColliderSpriteBase } from '../engine/display/ColliderSprite';
import { IPhysicsSprite, PhysicsSpriteBase } from '../engine/display/PhysicsSprite';
import { CollisionEventArgs, CollisionType } from '../engine/events/EventTypes';
import { EventDispatcher } from '../engine/events/EventDispatcher';
import { Rectangle } from '../engine/util/Rectangle';
import { Vector } from '../engine/util/Vector';
import { applyMixins } from '../engine/util/mixins';

export class LabFiveMario extends Sprite implements IRectCollider, IPhysicsSprite {
  grounded : boolean;

  constructor(id: string, filename: string) {
    super(id, filename);
    this.initPhysics();
    this.collisionLayer = 1;
    this.isTrigger = false;
    this.elasticity = 0.0;
    this.grounded = false;
    EventDispatcher.addGlobalListener(CollisionEventArgs.className, this.collisionHandler);
  }

  update() : void {
    super.update();
    this.updatePhysics();
  }

  private get collisionHandler() {
    var self = this;
    return (args : CollisionEventArgs) => {
      if ((args.type == CollisionType.Enter || args.type == CollisionType.Stay) && args.normal.y < 0) {
        console.log('grounded');
        this.grounded = true;
      }
      else if (args.type == CollisionType.Exit) {
        console.log('not grounded');
        this.grounded = false;
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
}
applyMixins(LabFiveMario, [RectColliderSpriteBase, PhysicsSpriteBase]);
