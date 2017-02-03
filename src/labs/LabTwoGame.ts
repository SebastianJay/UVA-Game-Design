"use strict";

import { Game } from '../engine/display/Game';
import { Sprite } from '../engine/display/Sprite';
import { ArrayList } from '../engine/util/ArrayList';
import { GameClock } from '../engine/util/GameClock';
import { Vector } from '../engine/util/Vector';

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

	update(pressedKeys : ArrayList<number>){
		super.update(pressedKeys);
    // handle key presses
		if (pressedKeys.contains(37)) {	// left
			this.mario.position.x = Math.max(this.mario.position.x - 10, 0);
		}
		if (pressedKeys.contains(38)) {	// up
			this.mario.position.y = Math.max(this.mario.position.y - 10, 0);
		}
		if (pressedKeys.contains(39)) {	// right
			this.mario.position.x = Math.min(this.mario.position.x + 10, this.width - this.mario.width);
		}
		if (pressedKeys.contains(40)) {	// down
			this.mario.position.y = Math.min(this.mario.position.y + 10, this.height - this.mario.height);
		}
    if (pressedKeys.contains('Q'.charCodeAt(0))) {
      this.mario.rotation += 3.0;
    }
    if (pressedKeys.contains('W'.charCodeAt(0))) {
      this.mario.rotation -= 3.0;
    }
    if (pressedKeys.contains('A'.charCodeAt(0))) {
      this.mario.localScale.x = Math.min(this.mario.localScale.x + 0.1, 2.0);
      this.mario.localScale.y = Math.min(this.mario.localScale.y + 0.1, 2.0);
    }
    if (pressedKeys.contains('S'.charCodeAt(0))) {
      this.mario.localScale.x = Math.max(this.mario.localScale.x - 0.1, 0.5);
      this.mario.localScale.y = Math.max(this.mario.localScale.y - 0.1, 0.5);
    }
    if (pressedKeys.contains('Z'.charCodeAt(0))) {
      this.mario.alpha = Math.min(this.mario.alpha + 0.05, 1.0);
    }
    if (pressedKeys.contains('X'.charCodeAt(0))) {
      this.mario.alpha = Math.max(this.mario.alpha - 0.05, 0.0);
    }
    if (pressedKeys.contains('V'.charCodeAt(0))) {
      this.mario.visible = !this.mario.visible;
    }
    if (pressedKeys.contains('J'.charCodeAt(0))) {
      this.mario.pivotPoint.x = Math.max(this.mario.pivotPoint.x - 0.04, 0);
    }
    if (pressedKeys.contains('I'.charCodeAt(0))) {
      this.mario.pivotPoint.y = Math.max(this.mario.pivotPoint.y - 0.04, 0);
    }
    if (pressedKeys.contains('L'.charCodeAt(0))) {
      this.mario.pivotPoint.x = Math.min(this.mario.pivotPoint.x + 0.04, 1);
    }
    if (pressedKeys.contains('K'.charCodeAt(0))) {
      this.mario.pivotPoint.y = Math.min(this.mario.pivotPoint.y + 0.04, 1);
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

	onClick(event : MouseEvent){
		if (this.mario.isInRect(new Vector(event.clientX, event.clientY))) {
			this.marioHealth -= 1;
		}
	}
}

/* Get the drawing canvas off of the  */
var drawingCanvas : HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;
if(drawingCanvas.getContext) {
	var game = new LabTwoGame(drawingCanvas);
	game.start();
}
