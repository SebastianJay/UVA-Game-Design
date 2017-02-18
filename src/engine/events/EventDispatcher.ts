"use strict";

import { ArrayList } from '../util/ArrayList';

/** Simple Event arguments struct */
export class EventArgs {
  // doing reflection in JS is tricky, so we do the lame approach
  get className() : string { return (<any>this.constructor).className; }

  // copy into extensions of EventArgs and replace string
  static get className() : string { return "EventArgs"; }
  constructor (public src : IEventDispatcher) { };
}

/** type alias for callback function */
export type EventCallback = (args : EventArgs) => any;

/** interface for publically visible members of an event dispatcher */
export interface IEventDispatcher {
  addEventListener : (type : string, callback : EventCallback) => void;
  removeEventListener : (type : string, callback : EventCallback) => void;
  hasEventListener : (type : string, callback : EventCallback) => boolean;
}

/**
 * Simple event dispatcher implementation. Listeners can be registered on
 * per-instance or global scope. Class is abstract so it is used as mixin.
 * Classes applying the EventDispatcher should (1) implement IEventDispatcher
 * (2) include the following interfaces in their class
addEventListener : (type : string, callback : EventCallback) => void;
removeEventListener : (type : string, callback : EventCallback) => void;
hasEventListener : (type : string, callback : EventCallback) => boolean;
protected initDispatcher : () => void;
protected dispatchEvent : (args : EventArgs) => void;
 * (3) execute this line after the class definition
applyMixins(ConcreteClass, [EventDispatcher,])
 */
type EventHash = {[id: string]: ArrayList<EventCallback>};
export abstract class EventDispatcher implements IEventDispatcher {
  private static _gListeners : EventHash = {};
  private _listeners : EventHash;

  protected initDispatcher() : void {
    this._listeners = {};
  }

  /** listen to all events of given type */
  static addGlobalListener(id : string, callback : EventCallback) : void {
    EventDispatcher._addEventListener(EventDispatcher._gListeners, id, callback);
  }
  /** stop listening to all events of given type (however local listeners are still registered) */
  static removeGlobalListener(id : string, callback : EventCallback) : void {
    EventDispatcher._removeEventListener(EventDispatcher._gListeners, id, callback);
  }
  /** check if listening to all events of given type */
  static hasGlobalListener(id : string, callback : EventCallback) : boolean {
    return EventDispatcher._hasEventListener(EventDispatcher._gListeners, id, callback);
  }

  /** listen to events of given type on this instance */
  addEventListener(id : string, callback : EventCallback) : void {
    EventDispatcher._addEventListener(this._listeners, id, callback);
  }
  /** stop listening to events of given type from this instance */
  removeEventListener(id : string, callback : EventCallback) : void {
    EventDispatcher._removeEventListener(this._listeners, id, callback);
  }
  /** check if listening to events of given type from this instance */
  hasEventListener(id : string, callback : EventCallback) : boolean {
    return EventDispatcher._hasEventListener(this._listeners, id, callback);
  }

  private static _addEventListener(listeners : EventHash, id : string, callback : EventCallback) : void {
    if (listeners[id] == null) {
      listeners[id] = new ArrayList<EventCallback>();
    }
    listeners[id].push(callback);
  }

  private static _removeEventListener(listeners : EventHash, id : string, callback : EventCallback) : void {
    if (listeners[id] != null) {
      listeners[id].remove(callback);
    }
  }
  private static _hasEventListener(listeners : EventHash, id : string, callback : EventCallback) : boolean {
    return listeners[id] != null && listeners[id].contains(callback);
  }

  /** broadcast the given EventArgs struct to any listeners */
  protected dispatchEvent(args : EventArgs) : void {
    var helper = (listeners : ArrayList<EventCallback>) => {
      if (listeners) {
        for (var i = 0; i < listeners.size(); i++) {
          listeners.get(i)(args);
        }
      }
    }
    // broadcast to local listeners
    helper(this._listeners[args.className]);
    // broadcast to global listeners
    helper(EventDispatcher._gListeners[args.className]);
  }
}
