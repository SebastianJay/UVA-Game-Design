"use strict";

import { Sprite } from '../engine/display/Sprite';
import { TextObject } from '../engine/display/TextObject';
import { GameClock } from '../engine/util/GameClock';
import { Vector } from '../engine/util/Vector';
import { TweenManager } from '../engine/tween/TweenManager';
import { Tween } from '../engine/tween/Tween';
import { TweenParam, TweenAttributeType, TweenFunctionType } from '../engine/tween/TweenParam';
import { TweenEventArgs } from '../engine/events/EventTypes';
import { EventDispatcher, EventCallback } from '../engine/events/EventDispatcher';

export class ScreenTransitionUI extends Sprite {

  private _callback : () => void;
  private _fadeHandler : EventCallback;
  private _textObj : TextObject;

  constructor(id : string, filename : string) {
    super(id, filename);
    this.alpha = 0;
    this._fadeHandler = this.fadeFinishedHandler;
    this._textObj = new TextObject(this.id + "_text");
    this._textObj.color = new Vector(255, 255, 255);
    this.addChild(this._textObj);
  }

  /**
   * Begins fading in with display text, then executes callback
   */
  fadeIn(callback : () => void, duration : number, text : string = '') : void {
    this._callback = callback;
    this._textObj.position = new Vector(0, 0);
    this._textObj.localScale = new Vector(1 / this.localScale.x, 1 / this.localScale.y);
    this._textObj.text = text;
    this.alpha = 0;
    TweenManager.instance.add(
      new Tween(this).animate(new TweenParam(TweenAttributeType.Alpha, 0.0, 1.0, duration, TweenFunctionType.Linear))
    );
    EventDispatcher.addGlobalListener(TweenEventArgs.ClassName, this._fadeHandler);
  }

  /**
   * Fades out the screen UI, then executes callback
   */
  fadeOut(callback : () => void, duration : number) : void {
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
