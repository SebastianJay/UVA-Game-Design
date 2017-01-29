"use strict";

/**
 * A very clock for keeping time (between frames or otherwise)
 *
 * */
export class GameClock{

	start : number;

	constructor(){
		this.resetGameClock();
	}

	/**
	 * Returns Milliseconds passed since the last time resetGameClock() was called
	 */
	getElapsedTime() : number{
		return new Date().getTime() - this.start;
	}

	resetGameClock() : void {
		this.start = new Date().getTime();
	}
}
