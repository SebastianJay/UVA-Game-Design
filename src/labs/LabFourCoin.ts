"use strict";

import { IEventDispatcher, EventDispatcher, EventCallback, EventArgs } from '../engine/events/EventDispatcher';
import { DisplayObject } from '../engine/display/DisplayObject';
import { Sprite } from '../engine/display/Sprite';
import { ArrayList } from '../engine/util/ArrayList';
import { applyMixins } from '../engine/util/mixins';

export class LabFourCoinEventArgs extends EventArgs {
  static get className() : string { return "LabFourCoinEventArgs"; }
  constructor (public src : IEventDispatcher,
    public pickedUp : boolean) {
    super(src);
  };
}

export class LabFourCoin extends Sprite implements IEventDispatcher {
  constructor(id : string, filename : string) {
    super(id, filename);
    this.initDispatcher();
  }

  /** Contrived method for checking collision and dispatching event */
  checkIfHitAndDisappear(obj : DisplayObject) : void {
    if (this.visible) {
      if (obj.x + obj.width * (1 - obj.pivotPoint.x) > this.x - this.width * (this.pivotPoint.x)
        && obj.x - obj.width * (obj.pivotPoint.x) < this.x + this.width * (1 - this.pivotPoint.x)
        && obj.y + obj.height * (1 - obj.pivotPoint.y) > this.y - this.height * (this.pivotPoint.y)
        && obj.y - obj.height * (obj.pivotPoint.y) < this.y + this.height * (1 - this.pivotPoint.y)) {
        this.visible = false;
        this.dispatchEvent(new LabFourCoinEventArgs(this,true));
      }
    }
  }

  // implemented by EventDispatcher mixin
  addEventListener : (type : string, callback : EventCallback) => void;
  removeEventListener : (type : string, callback : EventCallback) => void;
  hasEventListener : (type : string, callback : EventCallback) => boolean;
  protected initDispatcher : () => void;
  protected dispatchEvent : (args : EventArgs) => void;
}
applyMixins(LabFourCoin, [EventDispatcher]);
