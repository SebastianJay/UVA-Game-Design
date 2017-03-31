"use strict";

import { DisplayObjectContainer } from './DisplayObjectContainer';
import { Vector } from '../util/Vector';

export class Camera extends DisplayObjectContainer {
  private _screenPosition : Vector;
  constructor(id : string){
    super(id, '');
    this._screenPosition = Vector.zero;
  }

  get screenPosition() : Vector { return this._screenPosition; }
  set screenPosition(v : Vector) { this._screenPosition = v; }
  // TODO make methods for smooth panning, zooming, etc.

  //This function scrolls over the screen position.
  //A positive value causes a right scroll and a negative a left scroll
  // TODO make this scroll responsive to player speed & position so character is always visible
  //anm5je 3/30/17
scroll(ammount : number) {
  this._screenPosition.init(this._screenPosition.x + ammount, this._screenPosition.y, this._screenPosition.z);
}
  // copied from DisplayObject, but uses screenPosition instead of real position
	protected applyTransformations(g : CanvasRenderingContext2D) : void {
		if (this.parent) {
			g.translate(this.parent.pivotPoint.x * this.parent.unscaledWidth,
        this.parent.pivotPoint.y * this.parent.unscaledHeight);
		}
		g.translate(this.screenPosition.x, this.screenPosition.y);
		g.scale(this.localScale.x, this.localScale.y);
		g.rotate(Math.PI * this.rotation / 180.0);
		g.translate(-this.pivotDistance.x, -this.pivotDistance.y);
		g.globalAlpha = this.alpha;
	}

	protected reverseTransformations(g : CanvasRenderingContext2D) : void {
		g.globalAlpha = 1.0;	// set to opaque
		g.translate(this.pivotDistance.x, this.pivotDistance.y);
		g.rotate(Math.PI * -this.rotation / 180.0);
		g.scale(1 / this.localScale.x, 1 / this.localScale.y);
		g.translate(-this.screenPosition.x, -this.screenPosition.y);
		if (this.parent) {
			g.translate(-this.parent.pivotPoint.x * this.parent.unscaledWidth,
        -this.parent.pivotPoint.y * this.parent.unscaledHeight);
		}
  }
}
