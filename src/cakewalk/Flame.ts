"use strict";

import { ICircleCollider, CircleColliderSpriteBase } from '../engine/display/ColliderSprite';
import { IAnimatedSprite, AnimatedSpriteBase } from '../engine/display/AnimatedSprite';
import { CollisionEventArgs, CollisionType } from '../engine/events/EventTypes';
import { EventDispatcher } from '../engine/events/EventDispatcher';
import { CallbackManager } from '../engine/events/CallbackManager';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { Sprite } from '../engine/display/Sprite';
import { CircleColliderSprite } from '../engine/display/ColliderSprite';
import { applyMixins } from '../engine/util/mixins';
import { SoundManager } from '../engine/sound/SoundManager';
import { PlayerObject } from './PlayerObject';
import { MainGameSprite } from './MainGameSprite';
import { MainGameColor } from './MainGameEnums';

/**
 * A flame object in the environment which can be "stomped out" on contact
 * by the same colored player, but kills other players on contact
 */
export class Flame extends MainGameSprite implements IAnimatedSprite {
  private reflameDuration : number;
  private gameSoundEffects : string[] = ['burn', 'button', 'checkpoint', 'jump', 'loss', 'squash', 'tada', 'thud', 'swap', 'badswap']; // soundeffects


  constructor(id : string, filename : string, color : MainGameColor = MainGameColor.Neutral, reflameDuration : number = -1) {
    super(id, filename, color);
    this.initAnimation(filename);
    this.reflameDuration = reflameDuration;

    var hitbox = new CircleColliderSprite(id+'_box', '');
    hitbox.alpha = 0.5;
    hitbox.width = 42.5;
    hitbox.height = 42.5;
    hitbox.position.x = 5;
    hitbox.position.y = 20;
    hitbox.collisionLayer = 0;  // always collides, regardless of color
    hitbox.isTrigger = true;
    this.addChild(hitbox);

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
      if (args.type == CollisionType.Enter && (args.obj1 === self.getChild(0) || args.obj2 === self.getChild(0))
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
          SoundManager.instance.playFX(this.gameSoundEffects[0]);
          player.respawn();
          SoundManager.instance.playFX(this.gameSoundEffects[10]);
        }
      }
    }
  }

  animate : (animId: string) => void;
  isPaused : () => boolean;
  setPaused : (b : boolean) => void;
  setGlobalSpeed : (speed: number) => void;
  getGlobalSpeed : () => number;
  protected initAnimation : (filename : string) => void;
  protected updateAnimation : () => void;
}
applyMixins(Flame, [AnimatedSpriteBase]);
