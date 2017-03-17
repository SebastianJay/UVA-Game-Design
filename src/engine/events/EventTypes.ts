"use strict";

import { IEventDispatcher, EventArgs } from './EventDispatcher';
import { ICollider } from '../display/ColliderSprite';
import { DisplayObject } from '../display/DisplayObject';
import { TweenParam } from '../tween/TweenParam';
import { Vector } from '../util/Vector';

export class CollisionEventArgs extends EventArgs {
  static get ClassName() : string { return "CollisionEventArgs"; }
  constructor (public obj1 : string,
    public obj2 : string,
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
  constructor (public obj : DisplayObject,
    public tweenParam : TweenParam,
    public percentDone : number
  ) { super(); }

  get isBeginning() : boolean { return this.percentDone == 0.0; }
  get isFinishing() : boolean { return this.percentDone >= 1.0; }
}
