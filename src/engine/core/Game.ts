"use strict";

import { InputHandler } from '../input/InputHandler';

/**
 * Main class. Instantiate or extend Game to create a new game of your own
 */
export class Game{
	static instance : Game;

	gameId : string;
	width : number;
	height : number;
	canvas : HTMLCanvasElement;
	g : CanvasRenderingContext2D;
	playing : boolean;

	constructor(gameId : string, width : number, height : number, canvas : HTMLCanvasElement){
		Game.instance = this;

		this.gameId = gameId;
		this.width = width;
		this.height = height;
		this.canvas = canvas;
		this.g = canvas.getContext('2d'); //the graphics object
		this.playing = false;

		InputHandler.instance.registerInputFocus(this.canvas);
	}

	static getInstance(){ return Game.instance; }

	update(){}
	draw(g : CanvasRenderingContext2D){}

	start(){
		this.playing = true;
		window.requestAnimationFrame(this.nextFrameWrapper());
	}

	pause(){
		this.playing = false;
	}

	private nextFrameWrapper(){
		var __this = this;
		return () => {
			__this.update();
			__this.draw(__this.g);
			InputHandler.instance.update();
			if(__this.playing) {
				window.requestAnimationFrame(__this.nextFrameWrapper());
			}
		}
	}
}
