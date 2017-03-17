"use strict";

import { Game } from '../engine/display/Game';
import { DisplayObject } from '../engine/display/DisplayObject';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { InputHandler } from '../engine/input/InputHandler';
import { InputKeyCode } from '../engine/input/InputPrimitives';
import { TweenManager } from '../engine/tween/TweenManager';
import { Tween } from '../engine/tween/Tween';
import { TweenParam, TweenFunctionType, TweenAttributeType } from '../engine/tween/TweenParam';
import { SoundManager } from '../engine/sound/SoundManager';
import { Physics } from '../engine/util/Physics';
import { Vector } from '../engine/util/Vector';
import { LabFivePlatform } from './LabFivePlatform';
import { LabFiveMario } from './LabFiveMario';
import { LabSixCoin } from './LabSixCoin';

export class LabSixGame extends Game {
  mario : LabFiveMario;
  directionLeft : boolean;
  jumpForce : Vector = new Vector(0, -500);
  moveForce : Vector = new Vector(30, 0);

  constructor (canvas : HTMLCanvasElement) {
    super("Lab Six Game", 1200, 600, canvas);
    var p1, p2, p3, p4, p5, p6, c1;
    this.addChild(this.mario = new LabFiveMario('mario', 'animations/mario_moving.png')
      ).addChild(new DisplayObjectContainer('platform_root', '')
        .addChild(p1 = new LabFivePlatform('p1', 'lab5/brick.png'))
        .addChild(p2 = new LabFivePlatform('p2', 'lab5/brick.png'))
        .addChild(p3 = new LabFivePlatform('p3', 'lab5/brick.png'))
        .addChild(p4 = new LabFivePlatform('p4', 'lab5/brick.png'))
        .addChild(p5 = new LabFivePlatform('p5', 'lab5/brick.png'))
        .addChild(p6 = new LabFivePlatform('p6', 'lab5/brick.png'))
      ).addChild(new DisplayObjectContainer('coin_root', '')
        .addChild(c1 = new LabSixCoin('c1', 'lab4/coin.png'))
    );
    this.mario.position = new Vector(50, 250);
    this.mario.localScale = new Vector(4.0, 4.0);
    this.directionLeft = false;
    p1.position = new Vector(25, 400);
    p2.position = new Vector(300, 350);
    p3.position = new Vector(600, 250);
    p4.position = new Vector(900, 175);
    p5.position = new Vector(1150, 100);
    p6.position = new Vector(1050, 400);
    [p1, p2, p3, p4, p5, p6].map((obj : DisplayObject) => {
      obj.localScale = new Vector(4.0, 4.0);
    });
    c1.position = new Vector(1100, 300);
    c1.localScale = new Vector(0.3, 0.3);
    TweenManager.instance.add(new Tween(this.mario)
      .animate(new TweenParam(TweenAttributeType.ScaleX, 1.0, this.mario.localScale.x, 1.5, TweenFunctionType.Quadratic))
      .animate(new TweenParam(TweenAttributeType.ScaleY, 1.0, this.mario.localScale.y, 1.5, TweenFunctionType.Quadratic))
      .animate(new TweenParam(TweenAttributeType.Alpha, 0.0, 1.0, 1.5, TweenFunctionType.Quadratic))
    );
    SoundManager.instance.loadSound('coin', 'lab5/smw_coin.wav');
    SoundManager.instance.loadSound('bgm', 'lab5/vanilla_dome.mp3');
    SoundManager.instance.playMusic('bgm');
    Physics.SetCollisionMat(0, 1);  // check collisions between Mario and platforms
  }

  update() {
    super.update();
    if (TweenManager.instance.isTweening(this.mario)) {
      return; // do nothing to Mario if he is animating
    }
    // handle input
    if (InputHandler.instance.keyHeld(InputKeyCode.Left)) {
      this.mario.addForce(this.moveForce.multiply(-1));
      this.mario.animate('walk_left');
      this.directionLeft = true;
    } else if (InputHandler.instance.keyHeld(InputKeyCode.Right)) {
      this.mario.addForce(this.moveForce);
      this.mario.animate('walk');
      this.directionLeft = false;
    } else {
      if (this.directionLeft) {
        this.mario.animate('idle_left');
      } else {
        this.mario.animate('idle');
      }
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
	var game = new LabSixGame(drawingCanvas);
	game.start();
}
