"use strict";

import { ICircleCollider, CircleColliderSpriteBase } from '../engine/display/ColliderSprite';
import { IAnimatedSprite, AnimatedSpriteBase } from '../engine/display/AnimatedSprite';
import { CollisionEventArgs, CollisionType } from '../engine/events/EventTypes';
import { EventDispatcher } from '../engine/events/EventDispatcher';
import { CallbackManager } from '../engine/events/CallbackManager';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { Sprite } from '../engine/display/Sprite';
import { Circle } from '../engine/util/Circle';
import { applyMixins } from '../engine/util/mixins';

import { PlayerObject } from './PlayerObject';
import { MainGameSprite } from './MainGameSprite';
import { MainGameColor } from './MainGameEnums';

/**
 * A flame object in the environment which can be "stomped out" on contact
 * by the same colored player, but kills other players on contact
 */
export class Flame extends MainGameSprite implements ICircleCollider, IAnimatedSprite {
  private reflameDuration : number;

  constructor(id : string, filename : string, color : MainGameColor = MainGameColor.Neutral, reflameDuration : number = -1) {
    super(id, filename, color);
    this.initAnimation(filename);
    this.reflameDuration = reflameDuration;
    this.collisionLayer = 0;  //always collides, regardless of color
    this.isTrigger = true;
    /*
    var box = new Sprite(id+'_box', 'lab3/black_circle.png');
    box.alpha = 0.5;
    box.localScale.x = 0.45;
    box.localScale.y = 0.45;
    box.position.x = 10;
    box.position.y = 18;
    this.addChild(box);
    */
    EventDispatcher.addGlobalListener(CollisionEventArgs.ClassName, this.collisionHandler);
  }

  update(dt : number = 0) : void{
    super.update(dt);
    this.updateAnimation();
  }

  private get collisionHandler() {
    var self = this;
    return (args : CollisionEventArgs) => {
      // if player enters the flame
      if (args.type == CollisionType.Enter && (args.obj1 === self || args.obj2 === self)
        && (args.obj1 instanceof PlayerObject || args.obj2 instanceof PlayerObject)) {
        var player = ((args.obj1 instanceof PlayerObject) ? args.obj1 : args.obj2) as PlayerObject;
        if (player.color == self.color) {
          // same color -> player puts out flame
          // TODO tween out of existence?
          var parent = self.parent as DisplayObjectContainer;
          if (parent) {
            self.removeSelf();
            if (self.reflameDuration > 0) {
              CallbackManager.instance.addCallback(() => {
                // tween into existence?
                parent.addChild(self);
              }, self.reflameDuration);
            }
          }
        } else {
          // different color -> flame puts out player
          player.respawn();
        }
      }
    }
  }

  collisionLayer : number;
  isTrigger : boolean;
  getHitbox : () => Circle;

  animate : (animId: string) => void;
  isPaused : () => boolean;
  setPaused : (b : boolean) => void;
  setGlobalSpeed : (speed: number) => void;
  getGlobalSpeed : () => number;
  protected initAnimation : (filename : string) => void;
  protected updateAnimation : () => void;
}
applyMixins(Flame, [CircleColliderSpriteBase, AnimatedSpriteBase]);
