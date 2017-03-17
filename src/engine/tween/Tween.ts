"use strict";

import { DisplayObject } from '../display/DisplayObject';
import { ArrayList } from '../util/ArrayList';
import { TweenEventArgs } from '../events/EventTypes';
import { TweenParam, TweenAttributeType, TweenFunctionType } from './TweenParam';
import { IEventDispatcher, EventDispatcher, EventArgs, EventCallback } from '../events/EventDispatcher';
import { applyMixins } from '../util/mixins';

/**
 * A container for multiple TweenParams focused on a single DisplayObject
 */
export class Tween implements IEventDispatcher {
  private _object : DisplayObject;
  private _paramList : ArrayList<[TweenParam, number]>;

  constructor (object : DisplayObject) {
    this.initDispatcher();
    this._object = object;
    this._paramList = new ArrayList<[TweenParam, number]>();
  }

  /** Begin animations with the given configuration on the next update. Returns self to allow chaining. */
  animate(param : TweenParam) : Tween {
    this._paramList.add([param, 0.0]);
    return this;
  }

  /** Called by TweenManager in main loop to step forward the animation by dt */
  update(dt : number) : void {
    // apply transformations specified in params
    for (var i = 0; i < this._paramList.size(); i++) {
      var p = this.progress(this._paramList.get(i)[1],
        this._paramList.get(i)[0].duration,
        this._paramList.get(i)[0].function);
      var type = this._paramList.get(i)[0].type;
      var newVal = this._paramList.get(i)[0].startVal +
        (this._paramList.get(i)[0].endVal - this._paramList.get(i)[0].startVal) * p;
      if (type == TweenAttributeType.X) {
        this._object.position.x = newVal;
      } else if (type == TweenAttributeType.Y) {
        this._object.position.y = newVal;
      } else if (type == TweenAttributeType.ScaleX) {
        this._object.localScale.x = newVal;
      } else if (type == TweenAttributeType.ScaleY) {
        this._object.localScale.y = newVal;
      } else if (type == TweenAttributeType.Rotation) {
        this._object.rotation = newVal;
      } else if (type == TweenAttributeType.Alpha) {
        this._object.alpha = newVal;
      }
      this.dispatchEvent(new TweenEventArgs(this._object, this._paramList.get(i)[0], p));
    }

    // remove those tweens which are complete
    this._paramList = this._paramList.filter((e : [TweenParam, number]) => {
      return e[1] < e[0].duration;
    });

    // update each param's progress
    this._paramList = this._paramList.map((e : [TweenParam, number]) => {
      return [e[0], Math.min(e[1] + dt, e[0].duration)] as [TweenParam, number];
    });
  }

  /** Returns true if no outstanding tweens are remaining */
  get isComplete() : boolean {
    return this._paramList.size() == 0;
  }

  /** Returns focus of tweening */
  get object() : DisplayObject {
    return this._object;
  }

  private progress(t : number, duration : number, funcType : TweenFunctionType) : number {
    if (funcType == TweenFunctionType.Linear) {
      return t / duration;
    } else if (funcType == TweenFunctionType.Quadratic) {
      return (t * t) / (duration * duration); // ?
    }
  }

  addEventListener : (type : string, callback : EventCallback) => void;
  removeEventListener : (type : string, callback : EventCallback) => void;
  hasEventListener : (type : string, callback : EventCallback) => boolean;
  protected initDispatcher : () => void;
  protected dispatchEvent : (args : EventArgs) => void;
}
applyMixins(Tween, [EventDispatcher]);
