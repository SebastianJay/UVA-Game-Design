"use strict";

/**
 * A very clock for keeping time (between frames or otherwise)
 *
 * */
export class GameClock{

	private _start : number;

	constructor(){
		this.resetGameClock();
	}

	/**
	 * Returns Milliseconds passed since the last time resetGameClock() was called
	 */
	getElapsedTime() : number{
		return new Date().getTime() - this._start;
	}

	resetGameClock() : void {
		this._start = new Date().getTime();
	}

	get start(): number { return this._start; }
}
