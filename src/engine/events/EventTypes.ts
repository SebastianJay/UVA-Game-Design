"use strict";

import { IEventDispatcher, EventArgs } from './EventDispatcher';
import { ICollider } from '../display/ColliderSprite';
import { Vector } from '../util/Vector';

export class CollisionEventArgs extends EventArgs {
  static get ClassName() : string { return "CollisionEventArgs"; }
  constructor (public obj1 : string,
    public obj2 : string,
    public normal : Vector,
    public type : CollisionType
  ) { super(); };
}

export enum CollisionType {
  Enter,
  Stay,
  Exit
}
