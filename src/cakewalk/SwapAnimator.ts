'use strict';

import { TweenManager } from '../engine/tween/TweenManager';
import { Tween } from '../engine/tween/Tween';
import { TweenParam, TweenAttributeType, TweenFunctionType } from '../engine/tween/TweenParam';
import { CallbackManager } from '../engine/events/CallbackManager';
import { DisplayObject } from '../engine/display/DisplayObject';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { Sprite } from '../engine/display/Sprite';
import { Camera } from '../engine/display/Camera';
import { Vector } from '../engine/util/Vector';

import { PlayerObject } from './PlayerObject';

export class SwapAnimator extends DisplayObjectContainer {

  private _topCamera : Camera;
  private _bottomCamera : Camera;
  private _redPlayer : PlayerObject;
  private _bluePlayer : PlayerObject;

  private _redBurst : DisplayObjectContainer;
  private _blueBurst : DisplayObjectContainer;
  private _redStar : Sprite;
  private _blueStar : Sprite;

  constructor(id : string, topCamera : Camera, bottomCamera : Camera,
    redPlayer : PlayerObject, bluePlayer : PlayerObject) {
    super(id, '');
    this._topCamera = topCamera;
    this._bottomCamera = bottomCamera;
    this._redPlayer = redPlayer;
    this._bluePlayer = bluePlayer;

    this.addChild(this._redBurst = new DisplayObjectContainer(id+'_redburst', '')
      .addChild(new Sprite(id+'_redburst_0', 'CakeWalk/red_particle.png'))
      .addChild(new Sprite(id+'_redburst_1', 'CakeWalk/red_particle.png'))
      .addChild(new Sprite(id+'_redburst_2', 'CakeWalk/red_particle.png'))
      .addChild(new Sprite(id+'_redburst_3', 'CakeWalk/red_particle.png'))
    );
    this.addChild(this._blueBurst = new DisplayObjectContainer(id+'_blueburst', '')
      .addChild(new Sprite(id+'_blueburst_0', 'CakeWalk/blue_particle.png'))
      .addChild(new Sprite(id+'_blueburst_1', 'CakeWalk/blue_particle.png'))
      .addChild(new Sprite(id+'_blueburst_2', 'CakeWalk/blue_particle.png'))
      .addChild(new Sprite(id+'_blueburst_3', 'CakeWalk/blue_particle.png'))
    );
    for (var i = 0; i < this._redBurst.children.length; i++) {
      this._redBurst.getChild(i).localScale = new Vector(0.5, 0.5);
      this._redBurst.getChild(i).pivotPoint = new Vector(0.5, 0.5);
    }
    for (var i = 0; i < this._blueBurst.children.length; i++) {
      this._blueBurst.getChild(i).localScale = new Vector(0.5, 0.5);
      this._blueBurst.getChild(i).pivotPoint = new Vector(0.5, 0.5);
    }

    this.addChild(this._redStar = new Sprite(id+'_redstar', 'CakeWalk/red_star.png'));
    this.addChild(this._blueStar = new Sprite(id+'_bluestar', 'CakeWalk/blue_star.png'));
    this._redStar.localScale = new Vector(0.5, 0.5);
    this._redStar.pivotPoint = Vector.zero;
    this._blueStar.localScale = new Vector(0.5, 0.5);
    this._blueStar.pivotPoint = Vector.one;

    this._redBurst.visible = false;
    this._blueBurst.visible = false;
    this._redStar.visible = false;
    this._blueStar.visible = false;
  }

  burstAnimate(duration : number, fromRed : boolean) {
    // start the particle burst from the player that initiated the swap
    var targetPlayer = fromRed ? this._redPlayer : this._bluePlayer;
    var otherPlayer = fromRed ? this._bluePlayer : this._redPlayer;
    var targetBurst = fromRed ? this._redBurst : this._blueBurst;
    var targetPosition = this._topCamera.getChild(1) == targetPlayer ?
      this._topCamera.screenPosition.add(targetPlayer.position.add(targetPlayer.dimensions.divide(2))) :
      this._bottomCamera.screenPosition.add(targetPlayer.position.add(targetPlayer.dimensions.divide(2)));
    var otherPosition = this._topCamera.getChild(1) == otherPlayer ?
      this._topCamera.screenPosition.add(otherPlayer.position.add(otherPlayer.dimensions.divide(2))) :
      this._bottomCamera.screenPosition.add(otherPlayer.position.add(otherPlayer.dimensions.divide(2)));
    targetBurst.position = targetPosition;
    targetBurst.visible = true;
    for (var i = 0; i < targetBurst.children.length; i++) {
      var child = targetBurst.getChild(i);
      child.position = Vector.zero;
      child.alpha = 1.0;
      var destX = (Math.floor(Math.random() * 2) == 0 ? -1 : 1) * (Math.random() * 30 + 15);
      var destY = (Math.floor(Math.random() * 2) == 0 ? -1 : 1) * (Math.random() * 30 + 15);
      TweenManager.instance.add(new Tween(child)
        .animate(new TweenParam(TweenAttributeType.Alpha, 1.0, 0.0, duration * 3 / 4, TweenFunctionType.Linear))
        .animate(new TweenParam(TweenAttributeType.X, 0.0, destX, duration * 3 / 4, TweenFunctionType.Linear))
        .animate(new TweenParam(TweenAttributeType.Y, 0.0, destY, duration * 3 / 4, TweenFunctionType.Linear))
      );
    }

    // switch stars between players
    this._redStar.position = fromRed ? targetPosition : otherPosition;
    this._redStar.rotation = 0;
    this._redStar.visible = true;
    this._blueStar.position = fromRed ? otherPosition : targetPosition;
    this._blueStar.rotation = 0;
    this._blueStar.visible = true;
    TweenManager.instance.add(new Tween(this._redStar)
      .animate(new TweenParam(TweenAttributeType.X, this._redStar.x, this._blueStar.x, duration, TweenFunctionType.Quadratic))
      .animate(new TweenParam(TweenAttributeType.Y, this._redStar.y, this._blueStar.y, duration, TweenFunctionType.Quadratic))
      .animate(new TweenParam(TweenAttributeType.Rotation, 0, 360, duration, TweenFunctionType.Quadratic))
    );
    TweenManager.instance.add(new Tween(this._blueStar)
      .animate(new TweenParam(TweenAttributeType.X, this._blueStar.x, this._redStar.x, duration, TweenFunctionType.Quadratic))
      .animate(new TweenParam(TweenAttributeType.Y, this._blueStar.y, this._redStar.y, duration, TweenFunctionType.Quadratic))
      .animate(new TweenParam(TweenAttributeType.Rotation, 0, 360, duration, TweenFunctionType.Quadratic))
    );

    CallbackManager.instance.addCallback(() => {
      this._redBurst.visible = false;
      this._blueBurst.visible = false;
      this._redStar.visible = false;
      this._blueStar.visible = false;
    }, duration);
  }
}
