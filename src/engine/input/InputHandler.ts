"use strict";

import { ArrayList } from '../util/ArrayList';
import { Vector } from '../util/Vector';
import { GameClock } from '../util/GameClock';
import { InputKeyCode, InputMouseButton, InputGamepadButton, InputGamepadAxis } from './InputPrimitives';
import { InputGamepad } from './InputGamepad';

/*
 * Input Handler captures mouse and keyboard input and makes it accessible to Game through getters
 * credit http://stackoverflow.com/questions/30174078/how-to-define-singleton-in-typescript/36978360#36978360 for Singleton pattern
 */
export class InputHandler{

  private static _instance : InputHandler;

  private _element : HTMLElement;
  private clock : GameClock;
  private lastTimestamp : number;

  // the following mappings keep track of the most recent state changes of inputs
  // keyboard keys
  private pressedKeys : {timestamp: number, state: number}[];
  // mouse buttons
  private pressedButtons : {timestamp: number, state: number, location: Vector}[];
  // gamepad buttons
  private pressedGamepadButtons: {timestamp: number, state: number}[][];

  private gamepadStates : InputGamepad[];

  private constructor() {
    this.clock = new GameClock();
    this.lastTimestamp = this.clock.getElapsedTime();
    this.pressedKeys = [];
    this.pressedButtons = [];
    this.pressedGamepadButtons = [];
    this.gamepadStates = [];
    // initialize arrays with dummy data
    for (var i = 0; i < 256; i++) {
      this.pressedKeys[i] = {timestamp: this.clock.start, state: 0};
    }
    for (var i = 0; i < 3; i++) {
      this.pressedButtons[i] = {timestamp: this.clock.start, location: new Vector(0, 0), state: 0};
    }
    for (var i = 0; i < 4; i++) {
      this.pressedGamepadButtons[i] = [];
      for (var j = 0; j < 16; j++) {
        this.pressedGamepadButtons[i][j] = {timestamp: this.clock.start, state: 0};
      }
    }
  }
  public static get instance() : InputHandler
  {
    return this._instance || (this._instance = new this());
  }

  /** Given the canvas element, registers mouse and keyboard listeners to capture input */
  registerInputFocus(element : HTMLElement) : void {
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
  update() : void {
    this.lastTimestamp = this.clock.getElapsedTime();
    // gamepads poll instead of listen, so we refresh here
    this.gamepadStates = this.pollGamepads();
    for (var i = 0; i < this.gamepadStates.length; i++) {
      for (var j = 0; j < 16; j++) {
        var buttonState = this.gamepadStates[i].isButtonPressed(j) ? 1 : 0;
        if (buttonState != this.pressedGamepadButtons[i][j].state) {
          this.pressedGamepadButtons[i][j] = {
            timestamp: this.lastTimestamp + 0.001,  // add marginal time so up and down methods work
            state: buttonState
          };
        }
      }
    }
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
  keyUp(code : string | InputKeyCode) : boolean {
    var c = this.parseKeyParam(code);
    return (this.pressedKeys[c].timestamp > this.lastTimestamp
      && this.pressedKeys[c].state == 0);
  }

  /** Tells whether the given key is currently pressed */
  keyHeld(code : string | InputKeyCode) : boolean {
    var c = this.parseKeyParam(code);
    return (this.pressedKeys[c].state == 1);
  }

  /** Tells whether the given player index controller is connected to game */
  gamepadPresent(controller : number) : boolean {
    return (this.gamepadStates[controller] != null);
  }

  /** Tells whether the given button of given player index controller was pressed down since last update() */
  gamepadButtonDown(controller : number, code : InputGamepadButton) : boolean {
    return (this.gamepadPresent(controller)
      && this.pressedGamepadButtons[controller][code].timestamp > this.lastTimestamp
      && this.pressedGamepadButtons[controller][code].state == 1);
  }

  /** Tells whether the given button of given player index controller was unpressed down since last update() */
  gamepadButtonUp(controller : number, code : InputGamepadButton) : boolean {
    return (this.gamepadPresent(controller)
      && this.pressedGamepadButtons[controller][code].timestamp > this.lastTimestamp
      && this.pressedGamepadButtons[controller][code].state == 0);
  }

  /** Tells whether the given button of given player index controller is currently pressed */
  gamepadButtonHeld(controller : number, code : InputGamepadButton) : boolean {
    return (this.gamepadPresent(controller)
      && this.pressedGamepadButtons[controller][code].state == 1);
  }

  /** Value of given axis of given player index controller */
  gamepadAxis(controller : number, axis : InputGamepadAxis) : number {
    if (!this.gamepadPresent(controller)) {
      return 0;
    }
    if (axis == InputGamepadAxis.LeftHorizontal) {
      return this.gamepadStates[controller].getLeftStickXAxis();
    } else if (axis == InputGamepadAxis.LeftVertical) {
      return this.gamepadStates[controller].getLeftStickYAxis();
    } else if (axis == InputGamepadAxis.RightHorizontal) {
      return this.gamepadStates[controller].getRightStickXAxis();
    } else if (axis == InputGamepadAxis.RightVertical) {
      return this.gamepadStates[controller].getRightStickYAxis();
    }
    return 0;
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

  private pollGamepads() : InputGamepad[] {
    var gamepads : Gamepad[] = navigator.getGamepads ? navigator.getGamepads() : [];
    var toReturn : InputGamepad[] = [];
    for (var i = 0; i < gamepads.length; i++) {
      var gp = gamepads[i];
      toReturn.push(new InputGamepad(gp));
    }
    return toReturn;
  }
}
