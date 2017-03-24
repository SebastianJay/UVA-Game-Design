"use strict";

import { Game } from '../engine/display/Game';
import { DisplayObject } from '../engine/display/DisplayObject';
import { Sprite } from '../engine/display/Sprite';
import { Vector } from '../engine/util/Vector';

export class MainGame extends Game {
  private mario : DisplayObject;

  constructor (canvas : HTMLCanvasElement) {
    super("Lab Five Game", 1200, 600, canvas);
    this.addChild(this.mario = new Sprite('mario', 'Mario.png'));
    this.mario.position = new Vector(100, 100);
  }

  update() {
    super.update();
  }
}

/* Add this game to the canvas  */
var drawingCanvas : HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;
if(drawingCanvas.getContext) {
	var game = new MainGame(drawingCanvas);
	game.start();
}
