"use strict";

import { Sprite } from './Sprite';
import { applyMixins } from '../util/mixins';
import YAML = require('yamljs');

/** Struct describing properties of one animation state -- these must be followed in YAML */
interface AnimationConfig {
  startRowPixel: number;
  height: number;
  width: number;
  numStates: number;
  framesPerState: number;
  endBehavior: {
    name: string,
    arg?: number
  };
}

/** Interface for publicly visible members of AnimatedSprite */
export interface IAnimatedSprite {
  animate : (animId: string) => void;
  isPaused : () => boolean;
  setPaused : (b : boolean) => void;
  getGlobalSpeed : () => number;
  setGlobalSpeed : (speed: number) => void;
}

/**
 * A Sprite that runs through animations specified by a YAML file.
 *
 * Classes applying the AnimatedSpriteBase should (1) implement IAnimatedSprite
 * (2) include the following interfaces in their class
animate : (animId: string) => void;
isPaused : () => boolean;
setPaused : (b : boolean) => void;
setGlobalSpeed : (speed: number) => void;
getGlobalSpeed : () => number;
protected initAnimation : (filename : string) => void;
protected updateAnimation : () => void;
 * (3) execute this line after the class definition
applyMixins(ConcreteClass, [AnimatedSpriteBase,])
 */
export abstract class AnimatedSpriteBase extends Sprite {

  private _isAnimating : boolean;
  private _isPaused : boolean;
  private _isReversed : boolean;
  private _isStuck : boolean;
  private _currentAnimId : string;
  private _currentState : number;
  private _frameCounter : number;
  private _configDict : {[name: string]: AnimationConfig};
  private _globalSpeed : number;

  protected initAnimation(filename : string) : void {
    this._isAnimating = false;
    this._isPaused = false;
    this._isReversed = false;
    this._isStuck = false;
    this._currentAnimId = '';
    this._currentState = 0;
    this._frameCounter = 0;
    this._configDict = {};
    this._globalSpeed = 1.0;
    // load YAML file into _configDict
    var yamlName = filename.slice(0, filename.lastIndexOf('.')) + '.yml';
    var nativeConfig = YAML.load('resources/' + yamlName);
    for (var key in nativeConfig) {
      if (key == 'default') {
        // default is a special id that indicates an animation to start out with
        this.animate(nativeConfig[key]);
      } else {
        this._configDict[key] = nativeConfig[key];
      }
    }
  }

	protected updateAnimation() : void {
    if (this._isAnimating && !this._isPaused && !this._isStuck) {
      // advance frame counter until it hits the number of frames for animation slide
      this._frameCounter += 1;
      if (this._frameCounter >= this.getCurrentConfig().framesPerState / this._globalSpeed) {
        if (this._isReversed) {
          this._currentState -= 1;
        } else {
          this._currentState += 1;
        }
        this._frameCounter = 0;
      }
      // if reached end of animation, do end behavior
      if ((this._isReversed && this._currentState < 0)
        || this._currentState == this.getCurrentConfig().numStates) {
        switch (this.getCurrentConfig().endBehavior.name) {
          case 'loop':
            this._currentState = 0;
            break;
          case 'reverse':
            this._currentState = (this._isReversed ? 1 : this.getCurrentConfig().numStates - 2);
            this._isReversed = !this._isReversed;
            break;
          case 'stayInState':
            this._currentState = this.getCurrentConfig().numStates-1;
            this._isStuck = true;
            break;
          default:
            console.log("unrecognized animation end behavior: "
              + this.getCurrentConfig().endBehavior.name);
        }
      }
    }
	}

  // override drawImage to only take part of spritesheet
  protected drawImage(g: CanvasRenderingContext2D) {
    if (this._isAnimating) {
      g.drawImage(this.displayImage,
        this.getCurrentConfig().width * this._currentState, this.getCurrentConfig().startRowPixel,
        this.getCurrentConfig().width, this.getCurrentConfig().height,
        0, 0, this.getCurrentConfig().width, this.getCurrentConfig().height);
    }
  }

  // helper getter NOTE we don't use get currentConfig so mixin application works properly
  private getCurrentConfig() : AnimationConfig { return this._configDict[this._currentAnimId]; }

  // override dimensions to only be the part of the image being drawn
  protected getUnscaledWidth() : number { return (this._isAnimating ? this.getCurrentConfig().width : 0); }
  protected getUnscaledHeight() : number { return (this._isAnimating ? this.getCurrentConfig().height : 0); }

  // implementations of public methods
  isPaused(): boolean { return this._isPaused; }
  setPaused(p : boolean) { this._isPaused = p; }

  setGlobalSpeed(p : number) { this._globalSpeed = p; }
  getGlobalSpeed() : number { return this._globalSpeed; }

  get currentAnimationState() : string { return this._currentAnimId; }

  animate(animId: string) : void {
    if (this._currentAnimId != animId) {
      this._currentAnimId = animId;
      this._currentState = 0;
      this._frameCounter = 0;
      this._isReversed = false;
      this._isStuck = false;
      this._isAnimating = true;
    }
  }
}

/** Finally, a concrete implementation of the animated sprite */
export class AnimatedSprite extends Sprite implements IAnimatedSprite {

  constructor (id : string, filename : string) {
    super(id, filename);
    this.initAnimation(filename);
  }

  update(dt : number = 0) : void{
    super.update(dt);
    this.updateAnimation();
  }

  animate : (animId: string) => void;
  isPaused : () => boolean;
  setPaused : (b : boolean) => void;
  setGlobalSpeed : (speed: number) => void;
  getGlobalSpeed : () => number;
  protected initAnimation : (filename : string) => void;
  protected updateAnimation : () => void;
}
applyMixins(AnimatedSprite, [AnimatedSpriteBase]);
