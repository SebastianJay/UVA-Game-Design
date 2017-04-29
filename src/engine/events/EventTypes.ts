"use strict";

import { IEventDispatcher, EventArgs } from './EventDispatcher';
import { ICollider } from '../display/ColliderSprite';
import { DisplayObject } from '../display/DisplayObject';
import { Vector } from '../util/Vector';

export class CollisionEventArgs extends EventArgs {
  static get ClassName() : string { return "CollisionEventArgs"; }
  constructor (public obj1 : DisplayObject,
    public obj2 : DisplayObject,
    public normal : Vector,
    public type : CollisionType
  ) { super(); }
}

export enum CollisionType {
  Enter,
  Stay,
  Exit
}

export class TweenEventArgs extends EventArgs {
  static get ClassName() : string { return "TweenEventArgs"; }
  // the Tween object can be found by type casting the src
  constructor () { super(); }
}

export class CameraScrollEventArgs extends EventArgs {
  static get ClassName() : string { return "CameraScrollEventArgs"; }
  constructor(public dp : Vector) {
    super();
  }
}
