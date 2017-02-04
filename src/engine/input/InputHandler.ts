"use strict";

import { ArrayList } from '../util/ArrayList';
import { Vector } from '../util/Vector';
import { GameClock } from '../util/GameClock';
import { InputKeyCode, InputMouseButton } from './InputPrimitives';

/*
 * Input Handler captures mouse and keyboard input and makes it accessible to Game through getters
 * credit http://stackoverflow.com/questions/30174078/how-to-define-singleton-in-typescript/36978360#36978360 for Singleton pattern
 */
export class InputHandler{

  private static _instance : InputHandler;

  private element : HTMLElement;
  private clock : GameClock;
  private lastTimestamp : number;

  private pressedKeys : {timestamp: number, state: number}[];
  private pressedButtons : {timestamp: number, state: number, location: Vector}[];

  private constructor() {
    this.clock = new GameClock();
    this.lastTimestamp = this.clock.getElapsedTime();
    this.pressedKeys = [];
    this.pressedButtons = [];
    // initialize arrays with dummy data
    for (var i = 0; i < 256; i++) {
      this.pressedKeys[i] = {timestamp: this.clock.start, state: 0};
    }
    for (var i = 0; i < 3; i++) {
      this.pressedButtons[i] = {timestamp: this.clock.start, location: new Vector(0, 0), state: 0};
    }
  }
  public static get instance() : InputHandler
  {
    return this._instance || (this._instance = new this());
  }

  registerInputFocus(element : HTMLElement){
    if (this.element != null) {
      this.element.onmousedown = null;
      this.element.onmousemove = null;
      this.element.onmouseup = null;
    }
    // register mouse listener with canvas
    this.element = element;
    this.element.onmousedown = this.onMouseDownWrapper();
    this.element.onmousemove = this.onMouseMoveWrapper();
    this.element.onmouseup = this.onMouseUpWrapper();
    // register key listener with global window
    window.onkeydown = this.onKeyDownWrapper();
    window.onkeyup = this.onKeyUpWrapper();
  }

  /** Indicates that a frame has passed, resetting latest timestamp */
  update() {
    this.lastTimestamp = this.clock.getElapsedTime();
  }

  mouseDown(button? : InputMouseButton) : Vector {
    var b = button || InputMouseButton.Left;
    if (this.pressedButtons[b].timestamp > this.lastTimestamp
      && this.pressedButtons[b].state == 1) {
      return this.pressedButtons[b].location;
    }
    return null;
  }

  mouseUp(button? : InputMouseButton) : Vector {
    var b = button || InputMouseButton.Left;
    if (this.pressedButtons[b].timestamp > this.lastTimestamp
      && this.pressedButtons[b].state == 0) {
      return this.pressedButtons[b].location;
    }
    return null;
  }

  mouseHeld(button? : InputMouseButton) : Vector {
    var b = button || InputMouseButton.Left;
    if (this.pressedButtons[b].state == 1) {
      return this.pressedButtons[b].location;
    }
    return null;
  }

  mouseLocation(button? : InputMouseButton) : Vector {
    var b = button || InputMouseButton.Left;
    return this.pressedButtons[b].location;
  }

  keyDown(code : string | InputKeyCode) : boolean {
    var c = this.parseKeyParam(code);
    return (this.pressedKeys[c].timestamp > this.lastTimestamp
      && this.pressedKeys[c].state == 1);
  }

  keyUp(code : string | InputKeyCode) {
    var c = this.parseKeyParam(code);
    return (this.pressedKeys[c].timestamp > this.lastTimestamp
      && this.pressedKeys[c].state == 0);
  }

  keyHeld(code : string | InputKeyCode) {
    var c = this.parseKeyParam(code);
    return (this.pressedKeys[c].state == 1);
  }

  private parseKeyParam(code : string | InputKeyCode) : number {
    if (typeof code === "string") {
      return code.toUpperCase().charCodeAt(0);
    } else {
      return code;
    }
  }

  private onMouseDownWrapper() {
    return (event:MouseEvent) => {
      this.pressedButtons[event.button] = {
        timestamp: this.clock.getElapsedTime(),
        location: new Vector(event.clientX, event.clientY),
        state: 1,
      }
    }
  }

  private onMouseMoveWrapper() {
    return (event:MouseEvent) => {
      if (this.pressedButtons[event.button] == null) {
        this.pressedButtons[event.button] = {
          timestamp: this.clock.start,
          location: new Vector(event.clientX, event.clientY),
          state: 0,
        };
      }
      this.pressedButtons[event.button].location = new Vector(event.clientX, event.clientY);
    }
  }

  private onMouseUpWrapper() {
    return (event:MouseEvent) => {
      this.pressedButtons[event.button] = {
        timestamp: this.clock.getElapsedTime(),
        location: new Vector(event.clientX, event.clientY),
        state: 0,
      }
    }
  }

  private onKeyDownWrapper() {
    return (event:KeyboardEvent) => {
      this.pressedKeys[event.keyCode] = {
        timestamp: this.clock.getElapsedTime(),
        state: 1,
      }
    }
  }

  private onKeyUpWrapper() {
    return (event:KeyboardEvent) => {
      this.pressedKeys[event.keyCode] = {
        timestamp: this.clock.getElapsedTime(),
        state: 0,
      }
    }
  }
}
