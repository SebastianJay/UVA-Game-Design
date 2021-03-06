"use strict";

import { DisplayObjectContainer } from './DisplayObjectContainer';
import { IEventDispatcher, EventDispatcher, EventCallback, EventArgs } from '../events/EventDispatcher';
import { CameraScrollEventArgs } from '../events/EventTypes';
import { Vector } from '../util/Vector';
import { applyMixins } from '../util/mixins';

export class Camera extends DisplayObjectContainer implements IEventDispatcher {
  private _screenPosition : Vector; // where the object appears relative to the parent
                                    // real world coordinates can be different to separate collisions
  private _focusIndex : number;  // index of the child that is focus of the camera
  private _focusThreshold : number; // width of area in middle that focus should occupy
  private _focusWidth : number; // total width spanned by camera
  private _smoothFactor : number; // affects how smoothly camera catches up to player
  private _xBounds : [number, number];  // min and max x values to keep camera in

  constructor(id : string){
    super(id, '');
    this.initDispatcher();
    this._screenPosition = Vector.zero;
    this._focusIndex = -1;
    this._focusThreshold = 0;
    this._focusWidth = 0;
    this._xBounds = [-1e6, 1e6];
    this._smoothFactor = 0.05;
  }

  get screenPosition() : Vector { return this._screenPosition; }
  set screenPosition(v : Vector) { this._screenPosition = v; }

  //This function scrolls over the screen position.
  //A positive value causes a right scroll and a negative a left scroll
  scroll(amount : number) {
    this.screenPosition = new Vector(this.screenPosition.x + amount, this.screenPosition.y);
  }

  // makes the camera focus on a particular child
  setFocus(childIndex : number, thresholdWidth : number, totalWidth: number) {
    this._focusIndex = childIndex;
    this._focusThreshold = thresholdWidth;
    this._focusWidth = totalWidth;
  }

  // establishes the min and max x coordinates that the camera range cannot go beyond
  setXBounds(minX : number, maxX: number) {
    this._xBounds[0] = minX;
    this._xBounds[1] = maxX;
    this.boundPosition();
  }

  update(dt : number = 0) : void {
    super.update(dt);
    var previousPosition = this.screenPosition;
    if (this._focusIndex >= 0 && this._focusIndex < this.children.size()) {
      var child = this.children.get(this._focusIndex);
      var childScreenPos = child.position.x + this.screenPosition.x;
      var leftBoundPos = (this._focusWidth - this._focusThreshold) / 2;
      var rightBoundPos = (this._focusWidth + this._focusThreshold) / 2;
      if (childScreenPos < leftBoundPos) {
        this.scroll((leftBoundPos - childScreenPos) * this._smoothFactor);
      } else if (childScreenPos > rightBoundPos) {
        this.scroll((rightBoundPos - childScreenPos) * this._smoothFactor);
      }
    }
    this.boundPosition();
    if (!this.screenPosition.equals(previousPosition)) {
      this.dispatchEvent(new CameraScrollEventArgs(this.screenPosition.subtract(previousPosition)));
    }
  }

  draw(g : CanvasRenderingContext2D) : void {
    // clear rect spanned by camera
    g.clearRect(0, 0, this.width, this.height);
    super.draw(g);
  }

  // adjust the position now to the correct spot
  private boundPosition() : void {
    this.screenPosition.x = Math.max(this.screenPosition.x, -(this._xBounds[1] - this._focusWidth));
    this.screenPosition.x = Math.min(this.screenPosition.x, -this._xBounds[0]);
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
    g.globalAlpha = Math.min(1.0, Math.max(0.0, g.globalAlpha * this.alpha));
	}

	protected reverseTransformations(g : CanvasRenderingContext2D) : void {
    if (this.alpha != 0) {
      g.globalAlpha = Math.min(1.0, Math.max(0.0, g.globalAlpha / this.alpha));
    } else if (this.parent) {
      g.globalAlpha = this.parent.alpha;
    } else {
      g.globalAlpha = 1.0;	// set to opaque
    }
    g.translate(this.pivotDistance.x, this.pivotDistance.y);
    g.rotate(Math.PI * -this.rotation / 180.0);
    if (this.localScale.x != 0 && this.localScale.y != 0) {
      g.scale(1 / this.localScale.x, 1 / this.localScale.y);
    }
    g.translate(-this.screenPosition.x, -this.screenPosition.y);
    if (this.parent) {
      g.translate(-this.parent.pivotPoint.x * this.parent.unscaledWidth,
        -this.parent.pivotPoint.y * this.parent.unscaledHeight);
    }
  }

  addEventListener : (type : string, callback : EventCallback) => void;
  removeEventListener : (type : string, callback : EventCallback) => void;
  hasEventListener : (type : string, callback : EventCallback) => boolean;
  protected initDispatcher : () => void;
  protected dispatchEvent : (args : EventArgs) => void;
}
applyMixins(Camera, [EventDispatcher]);
