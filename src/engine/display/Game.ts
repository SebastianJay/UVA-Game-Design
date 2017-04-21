"use strict";

import { InputHandler } from '../input/InputHandler';
import { TweenManager } from '../tween/TweenManager';
import { CallbackManager } from '../events/CallbackManager';
import { DisplayObjectContainer } from '../display/DisplayObjectContainer';
import { Physics } from '../util/Physics';
import { GameClock } from '../util/GameClock';

/**
 * Main class. Instantiate or extend Game to create a new game of your own
 */
export class Game extends DisplayObjectContainer {
	private static _instance : Game;

	private _width : number;
	private _height : number;
	private _canvas : HTMLCanvasElement;
	private _g : CanvasRenderingContext2D;
	private _playing : boolean;
	private _lastTimestamp : number;
	private _clock : GameClock;

	constructor(gameId : string, width : number, height : number, canvas : HTMLCanvasElement){
		super(gameId, '');

		this._width = width;
		this._height = height;
		this._canvas = canvas;
		this._g = canvas.getContext('2d'); //the graphics object
		this._canvas.width = width;
		this._canvas.style.width = width + 'px';
		this._canvas.height = height;
		this._canvas.style.height = height + 'px';
		this._playing = false;
		this._clock = new GameClock();
		this._lastTimestamp = this._clock.getElapsedTime();

		Game._instance = this;
		InputHandler.instance.registerInputFocus(this._canvas);
	}

	update(dt : number = 0) : void{
		if (dt == 0) {
			var t = this._clock.getElapsedTime();
			dt = (t - this._lastTimestamp) / 1000;
			this._lastTimestamp = t;
		}
		super.update(dt);

		Physics.CollisionUpdate(this);
		DisplayObjectContainer.DrainRemoveQueue();
		TweenManager.instance.update(dt);
		CallbackManager.instance.update(dt);
	}

	draw(g : CanvasRenderingContext2D){
		// clear screen and reset transformation matrices
		g.setTransform(1, 0, 0, 1, 0, 0);
		g.clearRect(0, 0, this.width, this.height);
		// draw everything in display tree
		super.draw(g);
	}

	start(){
		this._playing = true;
		window.requestAnimationFrame(this.nextFrameWrapper);
	}

	pause(){
		this._playing = false;
	}

	get isPlaying(): boolean { return this._playing; }

	// override width, height to report this class's fields
	get width(): number { return this.getUnscaledWidth(); }
	get height(): number { return this.getUnscaledHeight(); }
	protected getUnscaledWidth() : number { return this._width; }
	protected getUnscaledHeight() : number { return this._height; }

	private get nextFrameWrapper() {
		var self = this;
		return () => {
			self.update();
			self.draw(self._g);
			InputHandler.instance.update();
			if(self._playing) {
				window.requestAnimationFrame(self.nextFrameWrapper);
			}
		}
	}

	static get instance() : Game { return Game._instance; }
}
