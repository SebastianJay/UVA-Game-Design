"use strict";

import { Game } from '../engine/display/Game';
import { DisplayObject } from '../engine/display/DisplayObject';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { Camera } from '../engine/display/Camera';
import { InputHandler } from '../engine/input/InputHandler';
import { InputKeyCode } from '../engine/input/InputPrimitives';
import { Sprite } from '../engine/display/Sprite';
import { Vector } from '../engine/util/Vector';
import { Physics } from '../engine/util/Physics';

import { PlayerObject } from './PlayerObject';
import { Platform } from './Platform';

export class MainGame extends Game {
  private world1 : Camera;
  private world2 : Camera;
  private player1 : PlayerObject;
  private player2 : PlayerObject;

  constructor (canvas : HTMLCanvasElement) {
    super("Lab Five Game", 1200, 600, canvas);

    // set up display tree
    var p1, p2;
    this.addChild(new DisplayObjectContainer('root', '')
      .addChild(new DisplayObjectContainer('root_UI', ''))
      .addChild(new DisplayObjectContainer('root_env', '')
        .addChild(this.world1 = new Camera('world1')
          .addChild(this.player1 = new PlayerObject('player1', 'animations/mario_moving.png'))
          .addChild(p1 = new Platform('platform1', 'lab5/brick.png')) as Camera)
        .addChild(this.world2 = new Camera('world2')
          .addChild(this.player2 = new PlayerObject('player2', 'animations/mario_moving_funky.png'))
          .addChild(p2 = new Platform('platform2', 'lab5/brick.png')) as Camera)
        )
      );

    this.world1.position = new Vector(0, 0);
    this.world2.position = new Vector(1e6, 1e6); // arbitrarily far away, so 2 worlds do not collide
    this.world1.screenPosition = new Vector(0, 0);
    this.world2.screenPosition = new Vector(0, this.height / 2);
    this.player1.position = new Vector(50, 50);
    this.player2.position = new Vector(50, 50);
    p1.position = new Vector(0, 200);
    p1.width = this.width;
    p2.position = new Vector(0, 200);
    p2.width = this.width;
    this.player1.localScale = new Vector(4.0, 4.0);
    this.player2.localScale = new Vector(4.0, 4.0);
    p1.localScale = new Vector(4.0, 4.0);
    p2.localScale = new Vector(4.0, 4.0);
    Physics.SetCollisionMat(0, 1);  // check collisions between player and platforms
  }

  update() {
    super.update();

    // handle input
    if (InputHandler.instance.keyHeld(InputKeyCode.Left)) {
      this.player1.run(-1);
    } else if (InputHandler.instance.keyHeld(InputKeyCode.Right)) {
      this.player1.run(1);
    } else {
      this.player1.run(0);
    }
    if (InputHandler.instance.keyDown(InputKeyCode.Up)) {
      this.player1.jump();
    }

    if (InputHandler.instance.keyHeld('A')) {
      this.player2.run(-1);
    } else if (InputHandler.instance.keyHeld('D')) {
      this.player2.run(1);
    } else {
      this.player2.run(0);
    }
    if (InputHandler.instance.keyDown('W')) {
      this.player2.jump();
    }

    if (InputHandler.instance.keyDown(' ')) {
      // swap player attributes
      var tmp = this.player1.position;
      this.player1.position = this.player2.position;
      this.player2.position = tmp;
      tmp = this.player1.velocity;
      this.player1.velocity = this.player2.velocity;
      this.player2.velocity = tmp;

      // switch two players in display tree
      if (this.world1.getChild(0) == this.player1) {
        this.world2.setChild(this.player1, 0);
        this.world1.setChild(this.player2, 0);
      } else {
        this.world1.setChild(this.player1, 0);
        this.world2.setChild(this.player2, 0);
      }
    }

    /*
    if (InputHandler.instance.keyHeld('Z')) {
      this.world1.screenPosition.x -= 5;
    } else if (InputHandler.instance.keyHeld('X')) {
      this.world1.screenPosition.x += 5;
    }
    */

    this.player1.addForce(Physics.Gravity.multiply(this.player1.mass));
    this.player2.addForce(Physics.Gravity.multiply(this.player2.mass));
  }
}

/* Add this game to the canvas  */
var drawingCanvas : HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;
if(drawingCanvas.getContext) {
	var game = new MainGame(drawingCanvas);
	game.start();
}
