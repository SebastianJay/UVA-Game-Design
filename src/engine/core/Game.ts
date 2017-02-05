"use strict";

import { InputHandler } from '../input/InputHandler';

/**
 * Main class. Instantiate or extend Game to create a new game of your own
 */
export class Game{
	static instance : Game;

	private _gameId : string;
	private _width : number;
	private _height : number;
	private _canvas : HTMLCanvasElement;
	private _g : CanvasRenderingContext2D;
	private _playing : boolean;

	constructor(gameId : string, width : number, height : number, canvas : HTMLCanvasElement){
		Game.instance = this;

		this._gameId = gameId;
		this._width = width;
		this._height = height;
		this._canvas = canvas;
		this._g = canvas.getContext('2d'); //the graphics object
		this._playing = false;

		InputHandler.instance.registerInputFocus(this._canvas);
	}

	static getInstance(){ return Game.instance; }

	update(){}
	draw(g : CanvasRenderingContext2D){}

	start(){
		this._playing = true;
		window.requestAnimationFrame(this.nextFrameWrapper());
	}

	pause(){
		this._playing = false;
	}

	get width(): number { return this._width; }
	get height(): number { return this._height; }
	get playing(): boolean { return this._playing; }

	private nextFrameWrapper(){
		var __this = this;
		return () => {
			__this.update();
			__this.draw(__this._g);
			InputHandler.instance.update();
			if(__this._playing) {
				window.requestAnimationFrame(__this.nextFrameWrapper());
			}
		}
	}
}
