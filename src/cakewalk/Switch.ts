"use strict";

import { IRectCollider, RectColliderSpriteBase } from '../engine/display/ColliderSprite';
import { Rectangle } from '../engine/util/Rectangle';
import { CollisionEventArgs, CollisionType } from '../engine/events/EventTypes';
import { EventDispatcher } from '../engine/events/EventDispatcher';
import { applyMixins } from '../engine/util/mixins';

import { PlayerObject } from './PlayerObject';
import { MainGameColor } from './MainGameEnums';
import { MainGameSprite } from './MainGameSprite';

/**
 * A switch that executes some given callback when pressed or unpressed.
 * Can be colored to only respond to certain players.
 */
export class Switch extends MainGameSprite implements IRectCollider {

  private _onEnter : () => void;
  private _onExit : () => void;
  private _isPressed : boolean;
  private _eventQueue : CollisionEventArgs[];

  constructor(id: string, filename: string, color : MainGameColor = MainGameColor.Neutral) {
    super(id, filename, color);
    this.collisionLayer = 0;  //always collides, regardless of color
    this.isTrigger = false;
    this._isPressed = false;
    this._eventQueue = [];
    EventDispatcher.addGlobalListener(CollisionEventArgs.ClassName, this.collisionHandler);
  }

  update() : void {
    // only process collisions if one event was thrown last frame
    // NOTE this logic may not be valid if multiple players can touch the same switch
    if (this._eventQueue.length == 1) {
      var args = this._eventQueue[0];
      if (!this._isPressed && args.type == CollisionType.Enter && args.normal.y < 0) {
        if (this.onEnter != null) {
          this.onEnter();
        }
        this._isPressed = true;
      } else if (this._isPressed && args.type == CollisionType.Exit) {
        if (this.onExit != null) {
          this.onExit();
        }
        this._isPressed = false;
      }
    }
    this._eventQueue = [];  // reset queue every frame
  }

  get onEnter() : () => void { return this._onEnter; }
  set onEnter(f : () => void) { this._onEnter = f; }
  get onExit() : () => void { return this._onExit; }
  set onExit(f : () => void) { this._onExit = f; }

  private get collisionHandler() {
    var self = this;
    return (args : CollisionEventArgs) => {
      // if same colored player enters or exits top of switch, execute callback
      if ((args.obj1 === self || args.obj2 === self)
        && (args.obj1 instanceof PlayerObject || args.obj2 instanceof PlayerObject)) {
        var player = ((args.obj1 instanceof PlayerObject) ? args.obj1 : args.obj2) as PlayerObject;
        if (player.color == self.color || self.color == MainGameColor.Neutral) {
          // only handle the events in the update() loop because if a player swaps
          //  multiple collision events will be thrown, causing a "race condition"
          if (args.type != CollisionType.Stay) {
            self._eventQueue.push(args);
          }
        }
      }
    }
  }

  collisionLayer : number;
  isTrigger : boolean;
  getHitbox : () => Rectangle;
}
applyMixins(Switch, [RectColliderSpriteBase]);
