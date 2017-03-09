"use strict";

import { Vector } from '../util/Vector';
import { Rectangle } from '../util/Rectangle';
import { Circle } from '../util/Circle';
import { Sprite } from './Sprite';

/** interface for publicly visible members of a collider */
export interface ICollider {
  collisionLayer : number;
  isTrigger : boolean;
  getHitbox : () => Rectangle | Circle;
}

export interface IRectCollider extends ICollider {
  getHitbox : () => Rectangle;
}

export interface ICircleCollider extends ICollider {
  getHitbox : () => Circle;
}

/**
 * Abstract mixin base types for the rect and circle colliders.
 *
 * Classes applying mixin should (1) implement IRectCollider or ICircleCollider
 * (2) include the following interfaces in their class:
collisionLayer : number;
isTrigger : boolean;
getHitbox : () => Rectangle;
OR
collisionLayer : number;
isTrigger : boolean;
getHitbox : () => Circle;
 * (3) execute this line after the class definition
applyMixins(ConcreteClass, [RectColliderSpriteBase,])
OR
applyMixins(ConcreteClass, [CircleColliderSpriteBase,])
 */
export abstract class RectColliderSpriteBase extends Sprite implements IRectCollider {
  collisionLayer : number;
  isTrigger : boolean;
  getHitbox() : Rectangle {
    var left = this.position.x - this.width * this.pivotPoint.x;
    var top = this.position.y - this.height * this.pivotPoint.y;
    // TODO handle rotation
    return Rectangle.fromPointDim(new Vector(left, top), this.width, this.height);
  }
}

export abstract class CircleColliderSpriteBase extends Sprite implements ICircleCollider {
  collisionLayer : number;
  isTrigger : boolean;
  getHitbox() : Circle {
    var centerX = this.position.x - this.width * (this.pivotPoint.x - 0.5);
    var centerY = this.position.y - this.height * (this.pivotPoint.y - 0.5);
    return new Circle(new Vector(centerX, centerY), this.width / 2);
  }
}
