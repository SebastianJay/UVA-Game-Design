"use strict";

import { IRectCollider, RectColliderSpriteBase } from '../engine/display/ColliderSprite';
import { IAnimatedSprite, AnimatedSpriteBase } from '../engine/display/AnimatedSprite';
import { CollisionEventArgs, CollisionType } from '../engine/events/EventTypes';
import { EventDispatcher } from '../engine/events/EventDispatcher';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { Rectangle } from '../engine/util/Rectangle';
import { applyMixins } from '../engine/util/mixins';

import { PlayerObject } from './PlayerObject';
import { MainGameSprite } from './MainGameSprite';
import { MainGameColor } from './MainGameEnums';

/**
 * A flame object in the environment which can be "stomped out" on contact
 * by the same colored player, but contact with the other player causes death
 */
export class Flame extends MainGameSprite implements IRectCollider, IAnimatedSprite {
  private reflameDuration : number;

  constructor(id : string, filename : string, color : MainGameColor = MainGameColor.Neutral, reflameDuration : number = -1) {
    super(id, filename, color);
    this.initAnimation(filename);
    this.reflameDuration = reflameDuration;
    this.collisionLayer = 0;  //always collides, regardless of color
    this.isTrigger = true;
    EventDispatcher.addGlobalListener(CollisionEventArgs.ClassName, this.collisionHandler);
  }

  update() : void {
    super.update();
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
          // player puts out flame
          // TODO tween out of existence?
          var parent = self.parent as DisplayObjectContainer;
          if (parent) {
            self.removeSelf();
            if (self.reflameDuration > 0) {
              // TODO rework setTimeout
              setTimeout(() => {
                parent.addChild(self);
              }, this.reflameDuration);
            }
          }
        } else {
          // flame puts out player
          player.respawn();
        }
      }
    }
  }

  collisionLayer : number;
  isTrigger : boolean;
  getHitbox : () => Rectangle;

  animate : (animId: string) => void;
  isPaused : () => boolean;
  setPaused : (b : boolean) => void;
  setGlobalSpeed : (speed: number) => void;
  getGlobalSpeed : () => number;
  protected initAnimation : (filename : string) => void;
  protected updateAnimation : () => void;
}
applyMixins(Flame, [RectColliderSpriteBase, AnimatedSpriteBase]);
