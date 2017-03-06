"use strict";

import { InputHandler } from '../input/InputHandler';
import { DisplayObjectContainer } from '../display/DisplayObjectContainer';

/**
 * Main class. Instantiate or extend Game to create a new game of your own
 */
export class Game extends DisplayObjectContainer {
	static instance : Game;

	private _gameId : string;
	private _width : number;
	private _height : number;
	private _canvas : HTMLCanvasElement;
	private _g : CanvasRenderingContext2D;
	private _playing : boolean;

	constructor(gameId : string, width : number, height : number, canvas : HTMLCanvasElement){
		super(gameId, '');
		Game.instance = this;

		this._gameId = gameId;
		this._width = width;
		this._height = height;
		this._canvas = canvas;
		this._g = canvas.getContext('2d'); //the graphics object
		this._canvas.width = width;
		this._canvas.height = height;
		this._playing = false;

		InputHandler.instance.registerInputFocus(this._canvas);
	}

	static getInstance(){ return Game.instance; }

	draw(g : CanvasRenderingContext2D){
		// clear screen and reset transformation matrices
		g.setTransform(1, 0, 0, 1, 0, 0);
		g.clearRect(0, 0, this.width, this.height);
		// draw everything in display tree
		super.draw(g);
	}

	start(){
		this._playing = true;
		window.requestAnimationFrame(this.nextFrameWrapper());
	}

	pause(){
		this._playing = false;
	}

	// override width, height to report this class's fields
	get width(): number { return this._width; }
	get height(): number { return this._height; }
	get unscaledWidth() : number {return this.width;}
	get unscaledHeight() : number {return this.height;}

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
