"use strict";

import { Sprite } from './Sprite';
import { Vector } from '../util/Vector';

/** Currently theorized but unimplemented */
export class TintedSprite extends Sprite {
  private _color : Vector;		// color of object

  constructor(id : string, filename : string){
    super(id, filename);
    this.color = new Vector(255, 255, 255);
  }

  set color(mColor : Vector){this._color = mColor.max(0).min(255);}
  get color() : Vector {return this._color;}

  private get colorString() : string {
		return '#' + this.hexFormat(this.color.r)
			+ this.hexFormat(this.color.g) + this.hexFormat(this.color.b);
	}
	private hexFormat(num : number) : string {
		return ('00' + num.toString(16)).slice(-2);
	}
}
