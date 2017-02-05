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

  private _element : HTMLElement;
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

  /** Given the canvas element, registers mouse and keyboard listeners to capture input */
  registerInputFocus(element : HTMLElement){
    if (this._element != null) {
      this._element.onmousedown = null;
      this._element.onmousemove = null;
      this._element.onmouseup = null;
    }
    // register mouse listener with canvas
    this._element = element;
    this._element.onmousedown = this.onMouseDownWrapper();
    this._element.onmousemove = this.onMouseMoveWrapper();
    this._element.onmouseup = this.onMouseUpWrapper();
    // register key listener with global window
    window.onkeydown = this.onKeyDownWrapper();
    window.onkeyup = this.onKeyUpWrapper();
  }

  /** Indicates that a frame has passed, resetting latest timestamp */
  update() {
    this.lastTimestamp = this.clock.getElapsedTime();
  }

  /** Gives location of mouse click if the given button has been pressed down since the last update(), null otherwise */
  mouseDown(button? : InputMouseButton) : Vector {
    var b = button || InputMouseButton.Left;
    if (this.pressedButtons[b].timestamp > this.lastTimestamp
      && this.pressedButtons[b].state == 1) {
      return this.pressedButtons[b].location;
    }
    return null;
  }

  /** Gives location of mouse click if the given button has been unpressed down since the last update(), null otherwise */
  mouseUp(button? : InputMouseButton) : Vector {
    var b = button || InputMouseButton.Left;
    if (this.pressedButtons[b].timestamp > this.lastTimestamp
      && this.pressedButtons[b].state == 0) {
      return this.pressedButtons[b].location;
    }
    return null;
  }

  /** Gives location of mouse if the given button is currently pressed down, null otherwise */
  mouseHeld(button? : InputMouseButton) : Vector {
    var b = button || InputMouseButton.Left;
    if (this.pressedButtons[b].state == 1) {
      return this.pressedButtons[b].location;
    }
    return null;
  }

  /** Gives location of mouse pointer */
  mouseLocation(button? : InputMouseButton) : Vector {
    var b = button || InputMouseButton.Left;
    return this.pressedButtons[b].location;
  }

  /** Tells whether the given key was pressed down since the last update() */
  keyDown(code : string | InputKeyCode) : boolean {
    var c = this.parseKeyParam(code);
    return (this.pressedKeys[c].timestamp > this.lastTimestamp
      && this.pressedKeys[c].state == 1);
  }

  /** Tells whether the given key was unpressed since the last update() */
  keyUp(code : string | InputKeyCode) {
    var c = this.parseKeyParam(code);
    return (this.pressedKeys[c].timestamp > this.lastTimestamp
      && this.pressedKeys[c].state == 0);
  }

  /** Tells whether the given key is currently pressed */
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
      if (this.pressedButtons[event.button].state == 0) {
        this.pressedButtons[event.button].timestamp = this.clock.getElapsedTime();
      }
      this.pressedButtons[event.button].state = 1;
      this.pressedButtons[event.button].location = new Vector(event.clientX, event.clientY);
    }
  }

  private onMouseMoveWrapper() {
    return (event:MouseEvent) => {
      this.pressedButtons[event.button].location = new Vector(event.clientX, event.clientY);
    }
  }

  private onMouseUpWrapper() {
    return (event:MouseEvent) => {
      if (this.pressedButtons[event.button].state == 1) {
        this.pressedButtons[event.button].timestamp = this.clock.getElapsedTime();
      }
      this.pressedButtons[event.button].state = 0;
      this.pressedButtons[event.button].location = new Vector(event.clientX, event.clientY);
    }
  }

  private onKeyDownWrapper() {
    return (event:KeyboardEvent) => {
      if (this.pressedKeys[event.keyCode].state == 0) {
        this.pressedKeys[event.keyCode].timestamp = this.clock.getElapsedTime();
      }
      this.pressedKeys[event.keyCode].state = 1;
    }
  }

  private onKeyUpWrapper() {
    return (event:KeyboardEvent) => {
      if (this.pressedKeys[event.keyCode].state == 1) {
        this.pressedKeys[event.keyCode].timestamp = this.clock.getElapsedTime();
      }
      this.pressedKeys[event.keyCode].state = 0;
    }
  }
}
