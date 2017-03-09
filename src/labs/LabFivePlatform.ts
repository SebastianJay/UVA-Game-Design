"use strict";

import { Sprite } from '../engine/display/Sprite';
import { IRectCollider, RectColliderSpriteBase } from '../engine/display/ColliderSprite';
import { Rectangle } from '../engine/util/Rectangle';
import { applyMixins } from '../engine/util/mixins';

export class LabFivePlatform extends Sprite implements IRectCollider {
  constructor(id: string, filename: string) {
    super(id, filename);
    this.collisionLayer = 0;
    this.isTrigger = false;
  }

  collisionLayer : number;
  isTrigger : boolean;
  getHitbox : () => Rectangle;
}
applyMixins(LabFivePlatform, [RectColliderSpriteBase]);
