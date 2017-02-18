"use strict";

import { LabFourCoinEventArgs } from './LabFourCoin';
import { EventDispatcher } from '../engine/events/EventDispatcher';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { Sprite } from '../engine/display/Sprite';

export class LabFourQuestUI extends DisplayObjectContainer {

  constructor(id : string, filename : string) {
    super(id, filename);
    this.visible = false;
    EventDispatcher.addGlobalListener(LabFourCoinEventArgs.className, this.coinEventHandler);
  }

  // the callback notation is a bit uglier than implementing IEventListener with notify()
  //  every handler needs to be a wrapper so that the proper "this" is used
  // the upshot is that one object can listen to multiple events with different methods
  private get coinEventHandler() {
    var self = this;
    return (args : LabFourCoinEventArgs) : void => {
      if (args.pickedUp) {
        self.visible = true;
      }
    }
  }
}
