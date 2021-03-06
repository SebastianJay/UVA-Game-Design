"use strict";

import { Sprite } from '../engine/display/Sprite';
import { DisplayObject } from '../engine/display/DisplayObject';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { ICircleCollider, CircleColliderSpriteBase } from '../engine/display/ColliderSprite';
import { Circle } from '../engine/util/Circle';
import { CollisionEventArgs } from '../engine/events/EventTypes';
import { EventDispatcher } from '../engine/events/EventDispatcher';
import { applyMixins } from '../engine/util/mixins';
import { SoundManager } from '../engine/sound/SoundManager';
import { LabFiveMario } from './LabFiveMario';

export class LabFiveCoin extends Sprite implements ICircleCollider {
  constructor(id: string, filename: string) {
    super(id, filename);
    this.collisionLayer = 0;
    this.isTrigger = true;
    EventDispatcher.addGlobalListener(CollisionEventArgs.ClassName, this.coinGetHandler);
  }

  private get coinGetHandler() {
    var self = this;
    return (args : CollisionEventArgs) => {
      if (args.obj1 instanceof LabFiveMario && args.obj2 === self
        || args.obj1 === self && args.obj2 instanceof LabFiveMario) {
        // play sound
        SoundManager.instance.playFX('coin');
        // remove coin from scene
        self.removeSelf();
      }
    }
  }

  collisionLayer : number;
  isTrigger : boolean;
  getHitbox : () => Circle;
}
applyMixins(LabFiveCoin, [CircleColliderSpriteBase]);
