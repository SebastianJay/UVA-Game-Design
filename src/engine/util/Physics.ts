"use strict";

import { Vector } from './Vector';
import { Circle } from './Circle';
import { Rectangle } from './Rectangle';
import { isCollider, isPhysicsSprite } from './typecheck';
import { IPhysicsSprite } from '../display/PhysicsSprite';
import { ICollider } from '../display/ColliderSprite';
import { DisplayObject } from '../display/DisplayObject';
import { DisplayObjectContainer } from '../display/DisplayObjectContainer';
import { IEventDispatcher, EventDispatcher, EventCallback, EventArgs } from '../events/EventDispatcher';
import { CollisionEventArgs, CollisionType } from '../events/EventTypes';
import { applyMixins } from './mixins';

/**
 * Handles all maths and logic associated with physics and collision.
 * Meant to be used statically, although some hackery is used for it to fire events as well.
 */
export class Physics implements IEventDispatcher {
  static GravityScalar : number = 9.81; // m / s^2
  static Gravity : Vector = new Vector(0, Physics.GravityScalar); // positive y is down onscreen
  static PixelsPerMeter : number = 10;
  static Epsilon : number = 0.000001;
  static DeltaTime : number = 0.033;
  private static _NumResolutionSteps : number = 8;
  private static _PreviousCollisions : {[id: string]: string[]} = {}

  // logic for collision matrixes
  private static _CollisionMatrix : {[id: number]: number[]} = {}
  public static SetCollisionMat(l1 : number, l2 : number, shouldCollide : boolean = true) : void {
    var layer1 = l1 < l2 ? l1 : l2;
    var layer2 = l1 > l2 ? l1 : l2;
    if (!(layer1 in Physics._CollisionMatrix)) {
      Physics._CollisionMatrix[layer1] = [];
    }
    if (shouldCollide && !(Physics._CollisionMatrix[layer1].indexOf(layer2) != -1)) {
      Physics._CollisionMatrix[layer1].push(layer2);
    } else if (!shouldCollide && Physics._CollisionMatrix[layer1].indexOf(layer2) != -1) {
      Physics._CollisionMatrix[layer1].splice(Physics._CollisionMatrix[layer1].indexOf(layer2), 1);
    }
  }
  public static CheckCollisionMat(l1 : number, l2 : number) : boolean {
    var layer1 = l1 < l2 ? l1 : l2;
    var layer2 = l1 > l2 ? l1 : l2;
    return (layer1 in Physics._CollisionMatrix && Physics._CollisionMatrix[layer1].indexOf(layer2) != -1);
  }
  public static GetCollisionPairs() : number[][] {
    var pairs = [];
    for (var key in Physics._CollisionMatrix) {
      var val = Physics._CollisionMatrix[key];
      for (var i = 0; i < val.length; i++) {
        pairs.push([key, val[i]]);
      }
    }
    return pairs;
  }

  // checking whether hitboxes intersect with each other
  public static CheckCollisionHitbox(a : Rectangle | Circle, b : Rectangle | Circle) : boolean {
    if (a instanceof Circle && b instanceof Circle) {
			return Physics._ccCol(a, b);
		} else if (a instanceof Rectangle && b instanceof Circle) {
			return Physics._rcCol(a, b);
		} else if (a instanceof Circle && b instanceof Rectangle) {
			return Physics._rcCol(b, a);
		} else if (a instanceof Rectangle && b instanceof Rectangle) {
			return Physics._rrCol(a, b);
		}
		return false;	// shouldn't get here
  }
  private static _rrCol(a : Rectangle, b : Rectangle) : boolean {
    return a.left < b.right && a.right > b.left
      && a.top < b.bottom && a.bottom > b.top;
  }
  private static _rcCol(a : Rectangle, b : Circle) : boolean {
    // NOTE this is an approximate solution, but not complete
    var pointInCircle = (p : Vector, c : Circle) : boolean => {
      return (p.x - c.center.x) * (p.x - c.center.x)
        + (p.y - c.center.y) * (p.y - c.center.y) <= c.radius * c.radius;
    }
    var pointInRect = (p : Vector, r : Rectangle) : boolean => {
      return p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom;
    }
    return pointInRect(b.center, a)
      || pointInRect(b.center.add(new Vector(0, b.radius)), a)
      || pointInRect(b.center.add(new Vector(b.radius, 0)), a)
      || pointInRect(b.center.add(new Vector(0, -b.radius)), a)
      || pointInRect(b.center.add(new Vector(-b.radius, 0)), a)
      || pointInCircle(a.centerPoint, b)
      || pointInCircle(a.topRightPoint, b)
      || pointInCircle(a.topLeftPoint, b)
      || pointInCircle(a.bottomRightPoint, b)
      || pointInCircle(a.bottomLeftPoint, b);
  }
  private static _ccCol(a : Circle, b : Circle) : boolean {
    return a.center.subtract(b.center).lengthSquared() < (a.radius + b.radius) * (a.radius + b.radius);
  }

  public static CollisionUpdate(root : DisplayObjectContainer) {
    // identify all colliders in display tree and group by layer
		var colliders : {[id: number] : (DisplayObject & ICollider)[]} = {};
		root.map((obj : DisplayObject) => {
			if (isCollider(obj)) {
				if (!(obj.collisionLayer in colliders)) {
					colliders[obj.collisionLayer] = [];
				}
				colliders[obj.collisionLayer].push(obj);
			}
		});
		// go through layer pairs that should collide and iterate through each list
		var pairs = Physics.GetCollisionPairs();
    var currentCollisions : {[id: string]: string[]} = {}
		for (var i = 0; i < pairs.length; i++) {
			var layer1 = pairs[i][0];
			var layer2 = pairs[i][1];
			for (var j = 0; j < colliders[layer1].length; j++) {
				for (var k = (layer1 == layer2 ? j+1 : 0); k < colliders[layer2].length; k++) {
					var obj1 = colliders[layer1][j];
					var obj2 = colliders[layer2][k];
					if (obj1.collidesWith(obj2)) {
            // update mapping
            if (!(obj1.id in currentCollisions)) {
              currentCollisions[obj1.id] = [];
            }
            currentCollisions[obj1.id].push(obj2.id);
						// resolve collision based on which sprite is moving
						if (isPhysicsSprite(obj1) && isPhysicsSprite(obj2)) {
							Physics.ResolveDynamicCollision(obj1, obj2);
						} else if (isPhysicsSprite(obj1)) {
							Physics.ResolveStaticCollision(obj1, obj2);
						} else if (isPhysicsSprite(obj2)) {
							Physics.ResolveStaticCollision(obj2, obj1);
						}
					}
				}
			}
		}
    // fire any events for collision exit
    for (var id in Physics._PreviousCollisions) {
      for (var i = 0; i < Physics._PreviousCollisions[id].length; i++) {
        var id2 = Physics._PreviousCollisions[id][i];
        if (!Physics.PairExistsInMapping(id, id2, currentCollisions)) {
          new Physics().dispatchEvent(new CollisionEventArgs(id, id2, Vector.zero, CollisionType.Exit));
        }
      }
    }
    Physics._PreviousCollisions = currentCollisions;
  }

  private static ResolveDynamicCollision(obj1 : IPhysicsSprite & ICollider & DisplayObject,
    obj2 : IPhysicsSprite & ICollider & DisplayObject) : void {
    console.log('dynamic collision not implemented.');
  }

  private static ResolveStaticCollision(obj1 : IPhysicsSprite & ICollider & DisplayObject,
    obj2 : ICollider & DisplayObject) : void {
    // adjust obj1 position to be close to collision point
    var dpos = obj1.position.subtract(obj1.previousPosition);
    var projectVector = (dp : Vector) : number => {
      var t = 0;
      var dt = 1.0;
      var reset = obj1.position;
      obj1.position = obj1.previousPosition;
      for (var i = 0; i < Physics._NumResolutionSteps; i++) {
        // on last iteration, only check for still colliding so object will be outside. TODO refactor
        if (i == Physics._NumResolutionSteps - 1) {
          if (obj1.collidesWith(obj2)) {
            t -= dt;
          }
        } else {
          dt /= 2;
          if (obj1.collidesWith(obj2)) {
            t -= dt;
          } else {
            t += dt;
          }
        }
        obj1.position = obj1.previousPosition.add(dp.multiply(t));
      }
      // reset position so no side effects occur within helper
      obj1.position = reset;
      return t;
    }
    var dtx = projectVector(new Vector(dpos.x, 0));
    var dty = projectVector(new Vector(0, dpos.y));
    if (!obj2.isTrigger) {
      obj1.position = obj1.previousPosition.add(new Vector(dpos.x * dtx, dpos.y * dty));
    }

    // adjust obj1 velocity based on collision normal
    var normal = Vector.zero;
    var staticHitbox = obj2.getHitbox();
    if (staticHitbox instanceof Rectangle) {
      var rectHitbox : Rectangle;
      var objHitbox = obj1.getHitbox();
      if (objHitbox instanceof Rectangle) {
        rectHitbox = objHitbox;
      } else {
        rectHitbox = Rectangle.fromBounds(objHitbox.center.x - objHitbox.radius,
          objHitbox.center.x + objHitbox.radius,
          objHitbox.center.y - objHitbox.radius,
          objHitbox.center.y + objHitbox.radius
        );
      }
      // TODO make better
      if (rectHitbox.right < staticHitbox.left) {
        normal.x = -1;
      } else if (rectHitbox.left > staticHitbox.right) {
        normal.x = 1;
      }
      if (rectHitbox.bottom < staticHitbox.top) {
        normal.y = -1;
      } else if (rectHitbox.top > staticHitbox.bottom) {
        normal.y = 1;
      }
    } else {
      normal = obj1.position.subtract(staticHitbox.center);
    }
    normal = normal.unit();
    if (!obj2.isTrigger) {
      if (obj1.elasticity == 0) {
        // inelastic collisions can retain velocity where possible TODO refactor
        obj1.velocity = new Vector(obj1.velocity.x * dtx, obj1.velocity.y * dty);
      } else {
        var nv = obj1.velocity.subtract(normal.multiply(2 * (obj1.velocity.dot(normal))));
        obj1.velocity = nv.multiply(obj1.elasticity);
      }
    }

    // fire event
    var type = Physics.PairExistsInMapping(obj1.id, obj2.id, Physics._PreviousCollisions)
      ? CollisionType.Stay : CollisionType.Enter;
    new Physics().dispatchEvent(new CollisionEventArgs(obj1.id, obj2.id, normal, type));
  }

  private static PairExistsInMapping(a: string, b:string, mapping:{[id: string]: string[]}) : boolean {
    return ((a in mapping && mapping[a].indexOf(b) != -1) || (b in mapping && mapping[b].indexOf(a) != -1));
  }

  private constructor() { this.initDispatcher(); } // only instantiate internally for firing events
  addEventListener : (type : string, callback : EventCallback) => void;
  removeEventListener : (type : string, callback : EventCallback) => void;
  hasEventListener : (type : string, callback : EventCallback) => boolean;
  protected initDispatcher : () => void;
  protected dispatchEvent : (args : EventArgs) => void;
}
applyMixins(Physics, [EventDispatcher]);
