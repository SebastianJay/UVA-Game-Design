"use strict";

import { Sprite } from './Sprite';
import { GameClock } from '../util/GameClock';
import YAML = require('yamljs');

/** Struct describing properties of one animation state -- these must be followed in YAML */
interface AnimationConfig {
  startRowPixel: number;
  height: number;
  width: number;
  numFrames: number;
  endBehavior: {
    name: string,
    arg?: number
  };
  speed: number;
}

/**
 * A Sprite that runs through animations specified by a YAML file
 */
export class AnimatedSprite extends Sprite {

  private _isAnimating : boolean;
  private _currentAnimId: string;
  private currentFrame : number;
  private frameCounter : number;
  private configDict : {[name: string]: AnimationConfig};
  private animClock : GameClock;

  constructor (id : string, filename : string) {
    super(id, filename);
    this._isAnimating = false;
    this._currentAnimId = '';
    this.currentFrame = 0;
    this.frameCounter = 0;
    this.configDict = {};
    this.animClock = new GameClock();
    // load YAML file into configDict
    var yamlName = filename.slice(0, filename.lastIndexOf('.')) + '.yml';
    var nativeConfig = YAML.load('resources/' + yamlName);
    for (var key in nativeConfig) {
      if (key == 'default') {
        // default is a special id that indicates an animation to start out with
        this.animate(nativeConfig[key]);
      } else {
        this.configDict[key] = nativeConfig[key];
      }
    }
  }

	update(){
    super.update();
    if (this.isAnimating) {
      // advance frame counter until it hits the number of frames for animation slide
      this.frameCounter += 1;
      if (this.frameCounter == this.currentConfig.speed) {
        this.currentFrame += 1;
        this.frameCounter = 0;
      }
      // if reached end of animation, do end behavior
      if (this.currentFrame == this.currentConfig.numFrames) {
        switch (this.currentConfig.endBehavior.name) {
          case 'loop':
            this.currentFrame = 0;
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
        this.currentConfig.width * this.currentFrame, this.currentConfig.startRowPixel,
        this.currentConfig.width, this.currentConfig.height,
        0, 0, this.currentConfig.width, this.currentConfig.height);
    }
	}

  // override width to only be the part of the image being drawn
  get unscaledWidth() : number { return (this.isAnimating ? this.currentConfig.width : 0);}
  get unscaledHeight() : number { return (this.isAnimating ? this.currentConfig.height : 0);}

  get isAnimating(): boolean { return this._isAnimating; }
  get currentAnimId() : string { return this._currentAnimId; }

  private get currentConfig() : AnimationConfig { return this.configDict[this.currentAnimId]; }

  animate(animId: string) : void {
    this._currentAnimId = animId;
    this._isAnimating = true;
  }
}
