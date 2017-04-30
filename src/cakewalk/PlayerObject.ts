"use strict";

import { DisplayObject } from '../engine/display/DisplayObject';
import { IRectCollider, RectColliderSpriteBase } from '../engine/display/ColliderSprite';
import { IPhysicsSprite, PhysicsSpriteBase } from '../engine/display/PhysicsSprite';
import { IAnimatedSprite, AnimatedSpriteBase } from '../engine/display/AnimatedSprite';
import { CollisionEventArgs, CollisionType } from '../engine/events/EventTypes';
import { CallbackManager } from '../engine/events/CallbackManager';
import { EventDispatcher } from '../engine/events/EventDispatcher';
import { TweenManager } from '../engine/tween/TweenManager';
import { Tween } from '../engine/tween/Tween';
import { TweenParam, TweenAttributeType, TweenFunctionType } from '../engine/tween/TweenParam';
import { TweenEventArgs } from '../engine/events/EventTypes';
import { Rectangle } from '../engine/util/Rectangle';
import { Vector } from '../engine/util/Vector';
import { Physics } from '../engine/util/Physics';
import { applyMixins } from '../engine/util/mixins';
import { SoundManager } from '../engine/sound/SoundManager';
import { MainGameColor } from './MainGameEnums';
import { MainGameSprite } from './MainGameSprite';

export class PlayerObject extends MainGameSprite implements IRectCollider, IPhysicsSprite, IAnimatedSprite {
  jumpTargetSpeed : number = 14; // m/s in y-axis that jump pulls player up to
  jumpMinSpeed : number = 8;  // m/s in y-axis that cancel jump pulls player to

  moveForce : Vector = new Vector(15, 0); // force for player running right
  topSpeed : number = 15;     // cap on horizontal speed
  runningSpeed : number = 5;  // speed to be considered running to qualify for reverse deceleration
  stillSpeed : number = 0.3;  // threshold speed at which player can stop moving
  reverseFactor : number = 2; // how strongly to decelerate if reversing direction
  rampDownFactor : number = 5; // how much to scale down velocity each frame when still (friction)
  rampDownAirFactor : number = 12; // how much to scale down velocity in midair when still (drag)

  respawnTime : number = 2; // how much time elapses from death to respawn
  swapCooldownTime : number = 3; // how much time elapses after player swaps before they can do it again

  grounded : boolean;  // whether the player is on the ground
  jumping : boolean;  // whether the player is in process of jumping
  private _currentDirectionRight : boolean;  // temp var
  private _inDeathState : boolean; // whether the character has died and is waiting to respawn
  private _canSwap : boolean; // whether the character is able to swap
  private _respawnPoint : Vector;  // if player dies, where to respawn
  private _eventQueue : CollisionEventArgs[]; // for processing multiple collisions in the update loop
  private gameSoundEffects : string[] = ['burn', 'button', 'checkpoint', 'jump', 'loss', 'squash', 'tada', 'thud', 'swap', 'badswap', 'respawn']; // soundeffects


  constructor(id: string, filename: string, color : MainGameColor) {
    super(id, filename, color);
    this.initPhysics();
    this.initAnimation(filename);
    this.grounded = false;
    this.jumping = false;
    this._respawnPoint = Vector.zero;
    this._eventQueue = [];
    this._currentDirectionRight = true;
    this._canSwap = true;
    this._inDeathState = false;

    this.collisionLayer = (this.color == MainGameColor.Red) ? 3 : 4;
    this.isTrigger = false;
    this.elasticity = 0.0;
    this.terminalSpeeds.x = this.topSpeed;
    EventDispatcher.addGlobalListener(CollisionEventArgs.ClassName, this.collisionHandler);
    


  }

  update(dt : number = 0) : void{
    super.update(dt);
    this.updatePhysics();
    this.updateAnimation();
    // process multiple collisions for player getting "squished" and dying
    if (!this._inDeathState) {
      var normalDirs = [false, false, false, false];  // whether player has a normal in N, E, S, W directions
      for (var i = 0; i < this._eventQueue.length; i++) {
        if (this._eventQueue[i].type == CollisionType.Enter || this._eventQueue[i].type == CollisionType.Stay) {
          if (this._eventQueue[i].normal.y < 0) {
            normalDirs[0] = true;
          }
          if (this._eventQueue[i].normal.x > 0) {
            normalDirs[1] = true;
            SoundManager.instance.playFX(this.gameSoundEffects[7]);
          }
          if (this._eventQueue[i].normal.y > 0) {
            normalDirs[2] = true;
          }
          if (this._eventQueue[i].normal.x < 0) {
            normalDirs[3] = true;
            SoundManager.instance.playFX(this.gameSoundEffects[7]);
          }
        }
      }
      if ((normalDirs[0] && normalDirs[2]) || (normalDirs[1] && normalDirs[3])) {
        SoundManager.instance.playFX(this.gameSoundEffects[5]);
        this.respawn();

      }
    }
    this._eventQueue = [];

  }

  /**
   * Called when the player wants to move the player horizontally
   * Direction is negative moving left, positive moving right, or zero if no input
   */
  run(direction : number) : void {
    if (direction < -0.5 && !this._inDeathState) {
      this.addForce(this.moveForce.multiply(-1)
        .multiply(this.velocity.x > this.runningSpeed && this.grounded ? this.reverseFactor : 1));
      this._currentDirectionRight = false;
      if (this.grounded) {
        this.animate('walk_left');
      } else {
        this.animate('jump_left');
      }
    } else if (direction > 0.5 && !this._inDeathState) {
      this.addForce(this.moveForce
        .multiply(this.velocity.x < -this.runningSpeed && this.grounded ? this.reverseFactor : 1));
      this._currentDirectionRight = true;
      if (this.grounded) {
        this.animate('walk');
      } else {
        this.animate('jump');
      }
    } else {
      if (Math.abs(this.velocity.x) < this.stillSpeed) {
        // effectively moves velocity back to zero
        this.addForce(new Vector(-this.velocity.x / Physics.DeltaTime * this.mass, 0));
      } else {
        // applies a "friction" related to player velocity
        this.addForce(new Vector(-(this.velocity.x / (this.grounded ? this.rampDownFactor : this.rampDownAirFactor))
          / Physics.DeltaTime * this.mass, 0));
      }

      if (!this._inDeathState && this.grounded) {
        if (this._currentDirectionRight) {
          this.animate('idle');
        } else{
          this.animate('idle_left');
        }
      }
    }
  }

  /**
  * Called when the player wants the player to jump
  */
  jump() : void {

    if (this.grounded && !this._inDeathState) {
      SoundManager.instance.playFX(this.gameSoundEffects[3]);
      // add force that would equate player's y speed to jumpTargetSpeed
      this.addForce(new Vector(0, -this.jumpTargetSpeed / Physics.DeltaTime * this.mass)
        .add(Physics.Gravity.multiply(this.mass)));
      this.jumping = true;

      if (this._currentDirectionRight) {
        this.animate('jump');
      } else {
        this.animate('jump_left');
      }
    }
  }

  /** Called when player releases jump button */
  cancelJump() : void {
    if (this.jumping && !this._inDeathState) {
      if (this.velocity.y < -this.jumpMinSpeed) {
        // moves velocity to jumpMinSpeed
        this.addForce(new Vector(0, -(this.velocity.y + this.jumpMinSpeed) / Physics.DeltaTime * this.mass)
          .add(Physics.Gravity.multiply(this.mass)));
      }
      this.jumping = false;
    }
  }

  /** Called when this player executed a swap */
  didSwap() : void {
    SoundManager.instance.playFX(this.gameSoundEffects[8]);
    this._canSwap = false;
    CallbackManager.instance.addCallback(() => {
      this._canSwap = true;
    }, this.swapCooldownTime);
    // TODO animation to show when you can swap again
    // temp animation - black circle appears over head
    var c : DisplayObject;
    this.addChild(c = new DisplayObject(this.id+'_swap_circle', 'lab3/black_circle.png'));
    c.localScale = new Vector(0.1, 0.1);
    c.position = new Vector(5, -15);
    var self = this;
    CallbackManager.instance.addCallback(() => {
      self.removeChild(c);
    }, this.swapCooldownTime);
  }

  /** Called when the player meets a death condition. reason specifies which animation to play. */
  respawn(reason? : string) : void {
    if (this._inDeathState) {
      return; // already dead, cannot overlap deaths
    }

    this._inDeathState = true;
    if (reason != null) {
      // TODO death animation
    } else {
      // temporary fade-out death tween
      var tw : Tween;
      TweenManager.instance.add(tw = new Tween(this)
        .animate(new TweenParam(TweenAttributeType.Alpha, 1.0, 0.0, this.respawnTime - 0.5, TweenFunctionType.Linear)));
    }

    var self = this;
    CallbackManager.instance.addCallback(() => {
      self.position = self.respawnPoint;
      self.velocity = Vector.zero;
      self._inDeathState = false;
      self.alpha = 1.0;
    }, this.respawnTime);



  }

  /** Resets internal state to be what it would be when a level starts */
  // NOTE be careful of ongoing timeout callbacks that may execute afterward
  reset() : void {
    this.previousPosition = this.position;
    this.velocity = Vector.zero;
    this._currentDirectionRight = true;
    this._inDeathState = false;
    this._canSwap = true;
    this.grounded = false;
    this.jumping = false;
    this.animate('idle');
  }

  get isAlive() : boolean { return !this._inDeathState; }
  get canSwap() : boolean { return this._canSwap; }

  get respawnPoint() : Vector { return this._respawnPoint; }
  set respawnPoint(vec : Vector) { this._respawnPoint = vec; }

  private get collisionHandler() {
    var self = this;
    return (args : CollisionEventArgs) => {
      if (args.obj1 === self || args.obj2 === self) {
        if ((args.type == CollisionType.Enter || args.type == CollisionType.Stay) && args.normal.y < 0) {
          this.grounded = true;
        }
        else if (args.type == CollisionType.Exit) {
          this.grounded = false;
        }
        this._eventQueue.push(args);
      }
    }
  }

  collisionLayer : number;
  isTrigger : boolean;
  getHitbox : () => Rectangle;

  mass : number;
  elasticity : number;
  acceleration : Vector;
  velocity : Vector;
  terminalSpeeds : Vector;
  previousPosition : Vector;
  addForce : (f : Vector) => void;
  protected initPhysics : () => void;
  protected updatePhysics : () => void;

  animate : (animId: string) => void;
  isPaused : () => boolean;
  setPaused : (b : boolean) => void;
  setGlobalSpeed : (speed: number) => void;
  getGlobalSpeed : () => number;
  protected initAnimation : (filename : string) => void;
  protected updateAnimation : () => void;
}
applyMixins(PlayerObject, [RectColliderSpriteBase, PhysicsSpriteBase, AnimatedSpriteBase]);
