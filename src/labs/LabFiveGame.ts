"use strict";

import { Game } from '../engine/display/Game';
import { DisplayObject } from '../engine/display/DisplayObject';
import { PhysicsSprite } from '../engine/display/PhysicsSprite';
import { InputHandler } from '../engine/input/InputHandler';
import { InputKeyCode } from '../engine/input/InputPrimitives';
import { Physics } from '../engine/util/Physics';
import { Vector } from '../engine/util/Vector';

export class LabFiveGame extends Game {
  mario : PhysicsSprite;

  constructor (canvas : HTMLCanvasElement) {
    super("Lab Five Game", 500, 500, canvas);
    this.addChild(this.mario = new PhysicsSprite('mario', 'Mario.png'));
    this.mario.position = new Vector(100, 100);
  }

  update() {
    super.update();
    // handle input

    // handle physics and collision
    this.mario.addForce(Physics.Gravity.multiply(this.mario.mass));
  }
}

/* Add this game to the canvas  */
var drawingCanvas : HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;
if(drawingCanvas.getContext) {
	var game = new LabFiveGame(drawingCanvas);
	game.start();
}
