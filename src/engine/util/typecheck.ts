"use strict";

import { ICollider } from '../display/ColliderSprite';
import { IAnimatedSprite } from '../display/AnimatedSprite';
import { IPhysicsSprite } from '../display/PhysicsSprite';

export function isCollider(o : any) : o is ICollider {
  return 'getHitbox' in o;
}

export function isAnimatedSprite(o : any) : o is IAnimatedSprite {
  return 'animate' in o;
}

export function isPhysicsSprite(o : any) : o is IPhysicsSprite {
  return 'addForce' in o;
}
