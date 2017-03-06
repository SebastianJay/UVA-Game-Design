"use strict";

import { Sprite } from './Sprite';
import { GameClock } from '../util/GameClock';
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
  setGlobalSpeed : (speed: number) => void;
  getGlobalSpeed : () => number;
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
protected drawAnimatedImage : (g : CanvasRenderingContext2D, displayImage : HTMLImageElement) => void;
 * (3) execute this line after the class definition
applyMixins(ConcreteClass, [AnimatedSpriteBase,])
 */
export abstract class AnimatedSpriteBase {

  private _isAnimating : boolean;
  private _isPaused : boolean;
  private _isReversed : boolean;
  private _currentAnimId : string;
  private _currentState : number;
  private _frameCounter : number;
  private _configDict : {[name: string]: AnimationConfig};
  private _animClock : GameClock;
  private _globalSpeed : number;

  protected initAnimation(filename : string) : void {
    this._isAnimating = false;
    this._isPaused = false;
    this._isReversed = false;
    this._currentAnimId = '';
    this._currentState = 0;
    this._frameCounter = 0;
    this._configDict = {};
    this._animClock = new GameClock();
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
    if (this._isAnimating && !this._isPaused) {
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
          default:
            console.log("unrecognized animation end behavior: "
              + this.getCurrentConfig().endBehavior.name);
        }
      }
    }
	}

  protected drawAnimatedImage(g : CanvasRenderingContext2D, displayImage : HTMLImageElement) : void {
    if (this._isAnimating) {
      g.drawImage(displayImage,
        this.getCurrentConfig().width * this._currentState, this.getCurrentConfig().startRowPixel,
        this.getCurrentConfig().width, this.getCurrentConfig().height,
        0, 0, this.getCurrentConfig().width, this.getCurrentConfig().height);
    }
	}

  // helper getter
  private getCurrentConfig() : AnimationConfig { return this._configDict[this._currentAnimId]; }

  // override width to only be the part of the image being drawn
  get unscaledWidth() : number { return (this._isAnimating ? this.getCurrentConfig().width : 0);}
  get unscaledHeight() : number { return (this._isAnimating ? this.getCurrentConfig().height : 0);}

  // implementations of public methods
  isPaused(): boolean { return this._isPaused; }
  setPaused(p : boolean) { this._isPaused = p; }

  setGlobalSpeed(p : number) { this._globalSpeed = p; }
  getGlobalSpeed() : number { return this._globalSpeed; }

  animate(animId: string) : void {
    this._currentAnimId = animId;
    this._isAnimating = true;
  }
}

/** Finally, a concrete implementation of the animated sprite */
export class AnimatedSprite extends Sprite implements IAnimatedSprite {

  constructor (id : string, filename : string) {
    super(id, filename);
    this.initAnimation(filename);
  }

  update() : void {
    super.update();
    this.updateAnimation();
  }

  protected drawImage(g: CanvasRenderingContext2D) {
    this.drawAnimatedImage(g, this.displayImage);
  }

  animate : (animId: string) => void;
  isPaused : () => boolean;
  setPaused : (b : boolean) => void;
  setGlobalSpeed : (speed: number) => void;
  getGlobalSpeed : () => number;
  protected initAnimation : (filename : string) => void;
  protected updateAnimation : () => void;
  protected drawAnimatedImage : (g : CanvasRenderingContext2D, displayImage : HTMLImageElement) => void;
}
applyMixins(AnimatedSprite, [AnimatedSpriteBase]);
