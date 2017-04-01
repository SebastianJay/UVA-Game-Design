"use strict";

/**
 * A wrapper around the Gamepad interface returned from Navigator
 */
export class InputGamepad {

	private gamepad : Gamepad;

	constructor(gamepad : Gamepad){
		this.gamepad = gamepad;
	}

	/**
	 * Given an index, returns boolean of whether or not that button is pressed
	 */
	isButtonPressed(index : number) : boolean {
		return this.buttonPressed(this.getButton(index));
	}

	/**
	 * These next four methods get the values of the two stick axes (goes from -1 to 1)
	 */
	getLeftStickXAxis() : number {
		return this.getAxisById(0)
	}

	getLeftStickYAxis() : number {
		return this.getAxisById(1)
	}

	getRightStickXAxis() : number {
		return this.getAxisById(2)
	}

	getRightStickYAxis() : number {
		return this.getAxisById(3)
	}

	private getButton(index : number) : GamepadButton {
		if(this.gamepad && this.gamepad.buttons && index>=0 && index<this.gamepad.buttons.length)
			return this.gamepad.buttons[index];
		return null;
	}

	private buttonPressed(button : GamepadButton) : boolean {
		if (button != null) {
  		return button.pressed;
		}
		return false;	// differs from template code
	}

	private getAxisById(index : number) : number {
		if(this.gamepad && this.gamepad.axes && this.gamepad.axes[index]){
		 	return this.gamepad.axes[index];
		}
	}

	/**
	 * Useful for debugging info if you need to figure out which button is mapped to which integers, etc.
	 */
	printGamepadInfo() : void {
		if(!this.gamepad) return;
		for (var i = 0; i < this.gamepad.buttons.length; i++) {
			var button = this.gamepad.buttons[i];
			if(button && button.pressed) console.log("Button id: " + i + "; Pressed: " + button.pressed);
		}

		for (var i = 0; i < this.gamepad.axes.length; i++) {
			var axis = this.gamepad.axes[i];
			if(axis && Math.abs(axis)>0.5) console.log("Axis id: " + i + "; Value: " + axis);
		}
	}
}
