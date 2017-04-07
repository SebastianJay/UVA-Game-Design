"use strict";

import { IRectCollider, RectColliderSpriteBase } from '../engine/display/ColliderSprite';
import { Rectangle } from '../engine/util/Rectangle';
import { applyMixins } from '../engine/util/mixins';

import { MainGameColor } from './MainGameEnums';
import { MainGameSprite } from './MainGameSprite';

/**
 * A platform that a player of the same color will pass through, but collides with different colored players
 */
export class Platform extends MainGameSprite implements IRectCollider {

  constructor(id: string, filename: string, color : MainGameColor = MainGameColor.Neutral) {
    super(id, filename, color);
    this.collisionLayer = (this.color == MainGameColor.Neutral) ? 0 :
      ((this.color == MainGameColor.Red) ? 1 : 2);
    this.isTrigger = false;
  }

  collisionLayer : number;
  isTrigger : boolean;
  getHitbox : () => Rectangle;
}
applyMixins(Platform, [RectColliderSpriteBase]);
