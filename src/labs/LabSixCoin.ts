"use strict";

import { Sprite } from '../engine/display/Sprite';
import { DisplayObject } from '../engine/display/DisplayObject';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { Game } from '../engine/display/Game';
import { ICircleCollider, CircleColliderSpriteBase } from '../engine/display/ColliderSprite';
import { Circle } from '../engine/util/Circle';
import { CollisionEventArgs, TweenEventArgs } from '../engine/events/EventTypes';
import { TweenManager } from '../engine/tween/TweenManager';
import { Tween } from '../engine/tween/Tween';
import { TweenParam, TweenFunctionType, TweenAttributeType } from '../engine/tween/TweenParam';
import { EventDispatcher, EventCallback } from '../engine/events/EventDispatcher';
import { applyMixins } from '../engine/util/mixins';
import { SoundManager } from '../engine/sound/SoundManager';
import { LabFiveMario } from './LabFiveMario';

export class LabSixCoin extends Sprite implements ICircleCollider {

  private coinCollide : EventCallback;
  private anim1Done : EventCallback;
  private anim2Done : EventCallback;

  constructor(id: string, filename: string) {
    super(id, filename);
    this.collisionLayer = 0;
    this.isTrigger = true;
    // by caching the callbacks here we can refer to them within the callback definition
    this.coinCollide = this.coinGetHandler;
    this.anim1Done = this.tweenOneFinishedHandler;
    this.anim2Done = this.tweenTwoFinishedHandler;
    EventDispatcher.addGlobalListener(CollisionEventArgs.ClassName, this.coinCollide);
  }

  private get coinGetHandler() {
    var self = this;
    return (args : CollisionEventArgs) => {
      var obj1 = DisplayObject.getById(args.obj1);
      var obj2 = DisplayObject.getById(args.obj2);
      if (obj1 instanceof LabFiveMario && obj2 === self
        || obj1 === self && obj2 instanceof LabFiveMario) {
        console.log('COIN GET');
        // play sound
        SoundManager.instance.playFX('coin');
        // commence first animation to blow coin up
        TweenManager.instance.add(new Tween(self)
          .animate(new TweenParam(TweenAttributeType.X, self.x, Game.instance.width / 2, 1.0, TweenFunctionType.Linear))
          .animate(new TweenParam(TweenAttributeType.Y, self.y, Game.instance.height / 2, 1.0, TweenFunctionType.Linear))
          .animate(new TweenParam(TweenAttributeType.ScaleX, self.localScale.x, 1.0, 1.0, TweenFunctionType.Linear))
          .animate(new TweenParam(TweenAttributeType.ScaleY, self.localScale.y, 1.0, 1.0, TweenFunctionType.Linear))
        );
        // listen for when tween finishes
        EventDispatcher.addGlobalListener(TweenEventArgs.ClassName, this.anim1Done);
        // do not handle further collision events
        EventDispatcher.removeGlobalListener(CollisionEventArgs.ClassName, this.coinCollide);
      }
    }
  }

  private get tweenOneFinishedHandler() {
    var self = this;
    return (args : TweenEventArgs) => {
      if ((args.src as Tween).isComplete) {
        TweenManager.instance.add(new Tween(self)
          .animate(new TweenParam(TweenAttributeType.Alpha, self.alpha, 0.0, 1.5, TweenFunctionType.Quadratic))
        );
        EventDispatcher.addGlobalListener(TweenEventArgs.ClassName, self.anim2Done);
        EventDispatcher.removeGlobalListener(TweenEventArgs.ClassName, self.anim1Done);
      }
    }
  }

  private get tweenTwoFinishedHandler() {
    var self = this;
    return (args : TweenEventArgs) => {
      if ((args.src as Tween).isComplete) {
        EventDispatcher.removeGlobalListener(TweenEventArgs.ClassName, self.anim2Done);
        // remove coin from scene
        self.removeSelf();
        console.log('COIN GONE');
      }
    }
  }

  collisionLayer : number;
  isTrigger : boolean;
  getHitbox : () => Circle;
}
applyMixins(LabSixCoin, [CircleColliderSpriteBase]);
