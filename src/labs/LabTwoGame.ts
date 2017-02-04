"use strict";

import { Game } from '../engine/core/Game';
import { Sprite } from '../engine/display/Sprite';
import { ArrayList } from '../engine/util/ArrayList';
import { GameClock } from '../engine/util/GameClock';
import { Vector } from '../engine/util/Vector';
import { InputHandler } from '../engine/input/InputHandler';
import { InputKeyCode } from '../engine/input/InputPrimitives';

/**
 * Mario Clicker 2.0
 */
export class LabTwoGame extends Game{

	mario : Sprite;
	marioHealth : number;
	marioTime : number;
	clock : GameClock;
	gameState : number;

	constructor(canvas : HTMLCanvasElement){
		super("Lab One Game", 500, 300, canvas);
		this.mario = new Sprite("Mario", "Mario.png");
		this.marioHealth = 5;
		this.marioTime = 30;
		this.clock = new GameClock();
		this.gameState = 0;
	}

	update(){
    // handle key presses
		if (InputHandler.instance.keyHeld(InputKeyCode.Left)) {
			this.mario.position.x = Math.max(this.mario.position.x - 10, 0);
		}
		if (InputHandler.instance.keyHeld(InputKeyCode.Up)) {
			this.mario.position.y = Math.max(this.mario.position.y - 10, 0);
		}
		if (InputHandler.instance.keyHeld(InputKeyCode.Right)) {
			this.mario.position.x = Math.min(this.mario.position.x + 10, this.width - this.mario.width);
		}
		if (InputHandler.instance.keyHeld(InputKeyCode.Down)) {
			this.mario.position.y = Math.min(this.mario.position.y + 10, this.height - this.mario.height);
		}
    if (InputHandler.instance.keyHeld('q')) {
      this.mario.rotation += 3.0;
    }
    if (InputHandler.instance.keyHeld('w')) {
      this.mario.rotation -= 3.0;
    }
    if (InputHandler.instance.keyHeld('a')) {
      this.mario.localScale.x = Math.min(this.mario.localScale.x + 0.1, 2.0);
      this.mario.localScale.y = Math.min(this.mario.localScale.y + 0.1, 2.0);
    }
    if (InputHandler.instance.keyHeld('s')) {
      this.mario.localScale.x = Math.max(this.mario.localScale.x - 0.1, 0.5);
      this.mario.localScale.y = Math.max(this.mario.localScale.y - 0.1, 0.5);
    }
    if (InputHandler.instance.keyHeld('z')) {
      this.mario.alpha = Math.min(this.mario.alpha + 0.05, 1.0);
    }
    if (InputHandler.instance.keyHeld('x')) {
      this.mario.alpha = Math.max(this.mario.alpha - 0.05, 0.0);
    }
    if (InputHandler.instance.keyDown('v')) {
      this.mario.visible = !this.mario.visible;
    }
    if (InputHandler.instance.keyHeld('j')) {
      this.mario.pivotPoint.x = Math.max(this.mario.pivotPoint.x - 0.04, 0);
    }
    if (InputHandler.instance.keyHeld('i')) {
      this.mario.pivotPoint.y = Math.max(this.mario.pivotPoint.y - 0.04, 0);
    }
    if (InputHandler.instance.keyHeld('l')) {
      this.mario.pivotPoint.x = Math.min(this.mario.pivotPoint.x + 0.04, 1);
    }
    if (InputHandler.instance.keyHeld('k')) {
      this.mario.pivotPoint.y = Math.min(this.mario.pivotPoint.y + 0.04, 1);
    }

		var event = InputHandler.instance.mouseDown();
		if (event != null && this.mario.isInRect(event)) {
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
		this.mario.draw(g);
	}
}

/* Get the drawing canvas off of the  */
var drawingCanvas : HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;
if(drawingCanvas.getContext) {
	var game = new LabTwoGame(drawingCanvas);
	game.start();
}
