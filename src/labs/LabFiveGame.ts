"use strict";

import { Game } from '../engine/display/Game';
import { DisplayObject } from '../engine/display/DisplayObject';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { PhysicsSprite } from '../engine/display/PhysicsSprite';
import { InputHandler } from '../engine/input/InputHandler';
import { InputKeyCode } from '../engine/input/InputPrimitives';
import { Physics } from '../engine/util/Physics';
import { Vector } from '../engine/util/Vector';
import { LabFivePlatform } from './LabFivePlatform';
import { LabFiveMario } from './LabFiveMario';

export class LabFiveGame extends Game {
  mario : LabFiveMario;
  jumpForce : Vector = new Vector(0, -500);
  moveForce : Vector = new Vector(30, 0);

  constructor (canvas : HTMLCanvasElement) {
    super("Lab Five Game", 500, 500, canvas);
    var p1, p2;
    this.addChild(this.mario = new LabFiveMario('mario', 'Mario.png'))
      .addChild(new DisplayObjectContainer('platform_root', '')
        .addChild(p1 = new LabFivePlatform('p1', 'lab5/brick.png'))
        .addChild(p2 = new LabFivePlatform('p2', 'lab5/brick.png'))
      );
    this.mario.position = new Vector(100, 100);
    p1.position = new Vector(100, 300);
    p1.localScale = new Vector(4.0, 4.0);
    p2.position = new Vector(300, 200);
    p2.localScale = new Vector(4.0, 4.0);
    Physics.SetCollisionMat(0, 1);  // check collisions between Mario and platforms
  }

  update() {
    super.update();
    // handle input
    if (InputHandler.instance.keyHeld(InputKeyCode.Left)) {
      this.mario.addForce(this.moveForce.multiply(-1));
    }
    if (InputHandler.instance.keyHeld(InputKeyCode.Right)) {
      this.mario.addForce(this.moveForce);
    }
    if (InputHandler.instance.keyHeld(InputKeyCode.Up)) {
      if (this.mario.grounded) {
        this.mario.addForce(this.jumpForce);
      }
    }
    this.mario.addForce(Physics.Gravity.multiply(this.mario.mass));
  }
}

/* Add this game to the canvas  */
var drawingCanvas : HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;
if(drawingCanvas.getContext) {
	var game = new LabFiveGame(drawingCanvas);
	game.start();
}
