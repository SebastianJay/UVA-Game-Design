"use strict";

import { Tween } from './Tween';
import { DisplayObject } from '../display/DisplayObject';
import { ArrayList } from '../util/ArrayList';
import { GameClock } from '../util/GameClock';

/**
 * A singleton class that handles attribute-based animations on DisplayObjects (as
 * opposed to spritesheet animations, which are in AnimatedSprite). While animations
 * are proceeding other properties like collision and physics should be suspended.
 * TweenManager uses realtime when updating animations, which differs from other
 * parts of the engine that have a frame-based approach.
 */
export class TweenManager {
  // singleton implementation
  private static _instance : TweenManager;
  public static get instance() : TweenManager
  {
    return this._instance || (this._instance = new this());
  }

  // fields
  private _tweenList : ArrayList<Tween>;
  private _tweenSet : {[id : string] : number}; // a hash set mirroring tweenList, the val is meaningless
  private _clock : GameClock;
  private _lastTimestamp : number;

  private constructor () {
    this._tweenList = new ArrayList<Tween>();
    this._tweenSet = {};
    this._clock = new GameClock();
    this._lastTimestamp = this._clock.getElapsedTime();
  }

  /** Adds a new Tween to the mix. It will be removed internally when it finishes. */
  add (tween : Tween) : void {
    this._tweenList.add(tween);
  }

  /** Called by main loop whenever Tweens should animate further */
  update () : void {
    // clock management
    var t = this._clock.getElapsedTime();
    var dt = t - this._lastTimestamp;
    this._lastTimestamp = t;

    // call update on all contained tweens
    for (var i = 0; i < this._tweenList.size(); i++) {
      this._tweenList.get(i).update(dt);
    }

    // remove any tweens which are complete
    this._tweenList = this._tweenList.filter((e : Tween) => {
      return !e.isComplete;
    });

    // update objects in tween hash set
    var newSet = {};
    for (var i = 0; i < this._tweenList.size(); i++) {
      newSet[this._tweenList.get(i).object.id] = 0;
    }
    this._tweenSet = newSet;
  }

  /** Returns whether the given DisplayObject (or one with given string id) is currently being animated */
  isTweening(obj : string | DisplayObject) : boolean {
    if (obj instanceof DisplayObject) {
      return obj.id in this._tweenSet;
    } else {
      return obj in this._tweenSet;
    }
  }
}
