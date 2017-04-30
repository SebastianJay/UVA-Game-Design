'use strict';

import { IRectCollider, RectColliderSpriteBase } from '../engine/display/ColliderSprite';
import { CollisionEventArgs, CollisionType } from '../engine/events/EventTypes';
import { EventDispatcher } from '../engine/events/EventDispatcher';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { Rectangle } from '../engine/util/Rectangle';
import { Vector } from '../engine/util/Vector';
import { ArrayList } from '../engine/util/ArrayList';
import { applyMixins } from '../engine/util/mixins';
import { SoundManager } from '../engine/sound/SoundManager';
import { PlayerObject } from './PlayerObject';

export class Checkpoint extends DisplayObjectContainer implements IRectCollider {

  // internally this is relative to this object's position
  // but externally (setter and getter) is embeds position info as well
  private _spawnPoint : Vector;
  private gameSoundEffects : string[] = ['burn', 'button', 'checkpoint', 'jump', 'loss', 'squash', 'tada', 'thud', 'swap', 'badswap']; // soundeffects


  constructor(id : string) {
    super(id, '');
    this.collisionLayer = 0;  // always collides, regardless of color
    this.isTrigger = true;    // does not alter collider physics
    this._spawnPoint = Vector.zero;
    EventDispatcher.addGlobalListener(CollisionEventArgs.ClassName, this.collisionHandler);
    SoundManager.instance.loadSound('checkpoint', 'CakeWalk/music/checkpoint.mp3');
  }

  get spawnPoint() : Vector { return this._spawnPoint.add(this.position); }
  set spawnPoint(v : Vector) { this._spawnPoint = v.subtract(this.position); }

  private get collisionHandler() {
    var self = this;
    return (args : CollisionEventArgs) => {
      // if player enters the zone
      if ((args.obj1 === self || args.obj2 === self)
        && (args.obj1 instanceof PlayerObject || args.obj2 instanceof PlayerObject)) {
        var player = ((args.obj1 instanceof PlayerObject) ? args.obj1 : args.obj2) as PlayerObject;
        // set the player's respawn point if this point is further along the level
        if (args.type == CollisionType.Enter && self.spawnPoint.x > player.respawnPoint.x) {
          player.respawnPoint = self.spawnPoint;
          SoundManager.instance.playFX(this.gameSoundEffects[2]);

        }
      }
    }
  }

  collisionLayer : number;
  isTrigger : boolean;
  getHitbox : () => Rectangle;
}
applyMixins(Checkpoint, [RectColliderSpriteBase]);
