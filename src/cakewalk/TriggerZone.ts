"use strict";

import { IRectCollider, RectColliderSpriteBase } from '../engine/display/ColliderSprite';
import { CollisionEventArgs, CollisionType } from '../engine/events/EventTypes';
import { EventDispatcher } from '../engine/events/EventDispatcher';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { Rectangle } from '../engine/util/Rectangle';
import { ArrayList } from '../engine/util/ArrayList';
import { applyMixins } from '../engine/util/mixins';

import { PlayerObject } from './PlayerObject';
import { MainGameSprite } from './MainGameSprite';
import { MainGameColor } from './MainGameEnums';

export class TriggerZone extends DisplayObjectContainer implements IRectCollider {
  private _playersInZone : ArrayList<PlayerObject>;

  constructor(id : string) {
    super(id, '');
    this.collisionLayer = 0;  // always collides, regardless of color
    this.isTrigger = true;    // does not alter collider physics
    this._playersInZone = new ArrayList<PlayerObject>();
    EventDispatcher.addGlobalListener(CollisionEventArgs.ClassName, this.collisionHandler);
  }

  get isPlayerInZone() : boolean { return this._playersInZone.length > 0; }

  private get collisionHandler() {
    var self = this;
    return (args : CollisionEventArgs) => {
      // if player enters the zone
      if ((args.obj1 === self || args.obj2 === self)
        && (args.obj1 instanceof PlayerObject || args.obj2 instanceof PlayerObject)) {
        var player = ((args.obj1 instanceof PlayerObject) ? args.obj1 : args.obj2) as PlayerObject;
        if (args.type == CollisionType.Enter) {
          this._playersInZone.add(player);
        } else if (args.type == CollisionType.Exit) {
          this._playersInZone.remove(player);
        }
      }
    }
  }

  collisionLayer : number;
  isTrigger : boolean;
  getHitbox : () => Rectangle;
}
applyMixins(TriggerZone, [RectColliderSpriteBase]);
