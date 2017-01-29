"use strict";

import { ArrayList } from '../util/ArrayList';

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
	pressedKeys : ArrayList<number>;

	constructor(gameId : string, width : number, height : number, canvas : HTMLCanvasElement){
		Game.instance = this;

		this.gameId = gameId;
		this.width = width;
		this.height = height;
		this.canvas = canvas;
		this.g = canvas.getContext('2d'); //the graphics object
		this.playing = false;

		this.pressedKeys = new ArrayList<number>();
		this.canvas.onclick = this.onClickWrapper();

		/* Setup a key listener */
		window.addEventListener("keydown", onKeyDown, true);
		window.addEventListener("keyup", onKeyUp, true);
	}

	static getInstance(){ return Game.instance; }

	update(pressedKeys : ArrayList<number>){}
	draw(g : CanvasRenderingContext2D){}

	nextFrame(){
		var __this = this;
		return () => {
			__this.update(__this.pressedKeys);
			__this.draw(__this.g);
			if(__this.playing) window.requestAnimationFrame(__this.nextFrame());
		}
	}

	start(){
		this.playing = true;
		window.requestAnimationFrame(this.nextFrame());
	}

	pause(){
		this.playing = false;
	}

	private onClickWrapper() {
		return (event:MouseEvent) => {
			this.onClick(event);
		}
	}

	onClick(event : MouseEvent){
	}

	/**
	 * For dealing with keyCodes
	 */
	addKey(keyCode : number){
		console.log("Key Code: " + keyCode); //for your convenience, you can see what the keyCode you care about is
		if(this.pressedKeys.indexOf(keyCode) == -1) this.pressedKeys.push(keyCode);
	}

	removeKey(keyCode : number){ this.pressedKeys.remove(keyCode); }
}

function onKeyDown(e : KeyboardEvent){ Game.getInstance().addKey(e.keyCode); }
function onKeyUp(e : KeyboardEvent){ Game.getInstance().removeKey(e.keyCode); }
