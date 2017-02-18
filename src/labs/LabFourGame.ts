"use strict";

import { Game } from '../engine/core/Game';
import { Sprite } from '../engine/display/Sprite';
import { DisplayObject } from '../engine/display/DisplayObject';
import { LabFourCoin } from './LabFourCoin';
import { LabFourQuestUI } from './LabFourQuestUI';
import { Vector } from '../engine/util/Vector';
import { InputHandler } from '../engine/input/InputHandler';
import { InputKeyCode } from '../engine/input/InputPrimitives';

export class LabFourGame extends Game {
  private mario : DisplayObject;
  private coin : LabFourCoin;
  private ui : DisplayObject;

  constructor(canvas : HTMLCanvasElement) {
    super("Lab Four Game", 500, 500, canvas);
    this.addChild(this.mario = new Sprite('mario', 'Mario.png'))
      .addChild(this.coin = new LabFourCoin('coin', 'lab4/coin.png'))
      .addChild(this.ui = new LabFourQuestUI('UI', 'lab4/quest_complete.png'));

    this.mario.position = new Vector(100, 100);
    this.coin.position = new Vector(400, 300);
    this.coin.localScale = new Vector(0.5, 0.5);
    this.ui.position = new Vector(this.width - 200, 20);
  }

  update() {
    super.update();
    // handle input
    if (InputHandler.instance.keyHeld(InputKeyCode.Left)) {
      this.mario.x -= 4;
    }
    if (InputHandler.instance.keyHeld(InputKeyCode.Up)) {
      this.mario.y -= 4;
    }
    if (InputHandler.instance.keyHeld(InputKeyCode.Right)) {
      this.mario.x += 4;
    }
    if (InputHandler.instance.keyHeld(InputKeyCode.Down)) {
      this.mario.y += 4;
    }
    // keep in bounds
    this.mario.position = this.mario.position.max(0)
      .min(new Vector(this.width - this.mario.width, this.height - this.mario.height));

    // check for collision
    this.coin.checkIfHitAndDisappear(this.mario);
  }
}

/* Add this game to the canvas  */
var drawingCanvas : HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;
if(drawingCanvas.getContext) {
	var game = new LabFourGame(drawingCanvas);
	game.start();
}
