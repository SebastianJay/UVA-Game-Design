"use strict";

import { Sprite } from './Sprite';
import { GameClock } from '../util/GameClock';
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

/**
 * A Sprite that runs through animations specified by a YAML file
 */
export class AnimatedSprite extends Sprite {

  private _isAnimating : boolean;
  private _isPaused : boolean;
  private _isReversed : boolean;
  private _currentAnimId : string;
  private _currentState : number;
  private _frameCounter : number;
  private _configDict : {[name: string]: AnimationConfig};
  private _animClock : GameClock;
  private _globalSpeed : number;

  constructor (id : string, filename : string) {
    super(id, filename);
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

	update(){
    super.update();
    if (this.isAnimating && !this.isPaused) {
      // advance frame counter until it hits the number of frames for animation slide
      this._frameCounter += 1;
      if (this._frameCounter >= this.currentConfig.framesPerState / this.globalSpeed) {
        if (this._isReversed) {
          this._currentState -= 1;
        } else {
          this._currentState += 1;
        }
        this._frameCounter = 0;
      }
      // if reached end of animation, do end behavior
      if ((this._isReversed && this._currentState < 0)
        || this._currentState == this.currentConfig.numStates) {
        switch (this.currentConfig.endBehavior.name) {
          case 'loop':
            this._currentState = 0;
            break;
          case 'reverse':
            this._currentState = (this._isReversed ? 1 : this.currentConfig.numStates - 2);
            this._isReversed = !this._isReversed;
            break;
          default:
            console.log("unrecognized animation end behavior: "
              + this.currentConfig.endBehavior.name
              + " on animation accompanying " + this.id);
        }
      }
    }
	}

  protected drawImage(g : CanvasRenderingContext2D) {
    if (this.isAnimating) {
      g.drawImage(this.displayImage,
        this.currentConfig.width * this._currentState, this.currentConfig.startRowPixel,
        this.currentConfig.width, this.currentConfig.height,
        0, 0, this.currentConfig.width, this.currentConfig.height);
    }
	}

  // override width to only be the part of the image being drawn
  get unscaledWidth() : number { return (this.isAnimating ? this.currentConfig.width : 0);}
  get unscaledHeight() : number { return (this.isAnimating ? this.currentConfig.height : 0);}

  get isAnimating(): boolean { return this._isAnimating; }
  get currentAnimId() : string { return this._currentAnimId; }

  get isPaused(): boolean { return this._isPaused; }
  set isPaused(p : boolean) { this._isPaused = p; }

  get globalSpeed() : number { return this._globalSpeed; }
  set globalSpeed(p : number) { this._globalSpeed = p; }

  private get currentConfig() : AnimationConfig { return this._configDict[this.currentAnimId]; }

  animate(animId: string) : void {
    this._currentAnimId = animId;
    this._isAnimating = true;
  }
}
