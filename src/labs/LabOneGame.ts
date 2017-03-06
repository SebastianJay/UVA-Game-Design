"use strict";

import { Game } from '../engine/display/Game';
import { Sprite } from '../engine/display/Sprite';
import { ArrayList } from '../engine/util/ArrayList';
import { GameClock } from '../engine/util/GameClock';
import { InputHandler } from '../engine/input/InputHandler';
import { InputKeyCode } from '../engine/input/InputPrimitives';

/**
 * Main class. Instantiate or extend Game to create a new game of your own.
 *
 * for now lots of logic is here rather than in the engine.
 */
export class LabOneGame extends Game{

	mario : Sprite;
	marioX : number;
	marioY : number;
	marioHealth : number;
	marioTime : number;
	clock : GameClock;
	gameState : number;

	constructor(canvas : HTMLCanvasElement){
		super("Lab One Game", 500, 300, canvas);
		this.mario = new Sprite("Mario", "Mario.png");
		this.marioX = 0;
		this.marioY = 0;
		this.marioHealth = 5;
		this.marioTime = 30;
		this.clock = new GameClock();
		this.gameState = 0;
	}

	update(){
		super.update();
		if (InputHandler.instance.keyHeld(InputKeyCode.Left)) {
			this.marioX = Math.max(this.marioX - 10, 0);
		}
		if (InputHandler.instance.keyHeld(InputKeyCode.Up)) {
			this.marioY = Math.max(this.marioY - 10, 0);
		}
		if (InputHandler.instance.keyHeld(InputKeyCode.Right)) {
			this.marioX = Math.min(this.marioX + 10, this.width - 128);
		}
		if (InputHandler.instance.keyHeld(InputKeyCode.Down)) {
			this.marioY = Math.min(this.marioY + 10, this.height - 128);
		}

		var event = InputHandler.instance.mouseDown();
		if (event != null
			&& event.x > this.marioX && event.x < this.marioX + 128
			&& event.y > this.marioY && event.y < this.marioY + 128) {
			this.marioHealth -= 1;
		}

		this.mario.update();
		if (this.gameState == 0) {
			var time = this.clock.getElapsedTime();
			this.marioTime -= time / 1000;
			if (this.marioTime <= 0 && this.marioHealth > 0) {
				this.gameState = 1;	// mario survives
			} else if (this.marioHealth <= 0) {
				this.gameState = 2;	// mario is killed
			}
			this.clock.resetGameClock();
		}
	}

	draw(g : CanvasRenderingContext2D){
		g.setTransform(1, 0, 0, 1, 0, 0);
		g.clearRect(0, 0, this.width, this.height);
		super.draw(g);
		if (this.gameState == 1) {
			g.strokeText('Mario survived! =)', 10, 10);
		} else if (this.gameState == 2) {
			g.strokeText('Mario died. =(', 10, 10);
		} else {
			g.strokeText('Health: '+ this.marioHealth + '\tTime: ' + this.marioTime.toFixed(2), 10, 10);
		}
		g.translate(this.marioX, this.marioY);
		this.mario.draw(g);
	}
}

/* Get the drawing canvas off of the  */
var drawingCanvas : HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;
if(drawingCanvas.getContext) {
	var game = new LabOneGame(drawingCanvas);
	game.start();
}
