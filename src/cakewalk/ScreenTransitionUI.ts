"use strict";

import { Sprite } from '../engine/display/Sprite';
import { GameClock } from '../engine/util/GameClock';
import { TweenManager } from '../engine/tween/TweenManager';
import { Tween } from '../engine/tween/Tween';
import { TweenParam, TweenAttributeType, TweenFunctionType } from '../engine/tween/TweenParam';
import { TweenEventArgs } from '../engine/events/EventTypes';
import { EventDispatcher, EventCallback } from '../engine/events/EventDispatcher';

export class ScreenTransitionUI extends Sprite {

  private _callback : () => void;
  private _fadeHandler : EventCallback;

  constructor(id : string, filename : string) {
    super(id, filename);
    this.alpha = 0;
    this._fadeHandler = this.fadeFinishedHandler;
  }

  /**
   * Begins fading in with display text, then executes callback
   */
  fadeIn(duration : number, callback : () => void) : void {
    this._callback = callback;
    this.alpha = 0;
    TweenManager.instance.add(
      new Tween(this).animate(new TweenParam(TweenAttributeType.Alpha, 0.0, 1.0, duration, TweenFunctionType.Linear))
    );
    EventDispatcher.addGlobalListener(TweenEventArgs.ClassName, this._fadeHandler);
  }

  /**
   * Fades out the screen UI, then executes callback
   */
  fadeOut(duration : number, callback : () => void) : void {
    this._callback = callback;
    this.alpha = 1;
    TweenManager.instance.add(
      new Tween(this).animate(new TweenParam(TweenAttributeType.Alpha, 1.0, 0.0, duration, TweenFunctionType.Linear))
    );
    EventDispatcher.addGlobalListener(TweenEventArgs.ClassName, this._fadeHandler);
  }

  get isFading() {
    return TweenManager.instance.isTweening(this);
  }

  private get fadeFinishedHandler() {
    var self = this;
    return (args : TweenEventArgs) => {
      var tween = args.src as Tween;
      if (tween.object == self && tween.isComplete) {
        EventDispatcher.removeGlobalListener(TweenEventArgs.ClassName, self._fadeHandler);
        self._callback();
      }
    }
  }
}
