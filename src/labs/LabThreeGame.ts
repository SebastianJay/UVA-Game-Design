"use strict";

import { Game } from '../engine/display/Game';
import { DisplayObject } from '../engine/display/DisplayObject';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { Sprite } from '../engine/display/Sprite';
import { GameClock } from '../engine/util/GameClock';
import { Vector } from '../engine/util/Vector';
import { InputHandler } from '../engine/input/InputHandler';
import { InputKeyCode } from '../engine/input/InputPrimitives';

export class LabThreeGame extends Game {
  clock : GameClock;

   /**
    * id - string ID associated with body
    * startT - offset with which to start elliptical motion
    * period - number seconds period of motion
    * xRadius - radius of motion in x direction
    * yRadius - radius of motion in y direction
    */
  bodyPaths : {id: string, startT: number, period: number,
    xRadius: number, yRadius: number}[];

  constructor(canvas : HTMLCanvasElement) {
    super("Lab Three Game", 1000, 700, canvas);
    this.clock = new GameClock();

    // set up tree
    this.addChild(new DisplayObjectContainer('root', "")
      .addChild(new Sprite('bg', "lab3/black_circle.png"))
      .addChild(new Sprite('sun', "lab3/sun.png")
        .addChild(new Sprite('mercury', "lab3/white_circle.png"))
        .addChild(new Sprite('venus', "lab3/orange_circle.png"))
        .addChild(new Sprite('earth', "lab3/blue_circle.png")
          .addChild(new Sprite('earth_moon', "lab3/gray_circle.png")))
        .addChild(new Sprite('mars', "lab3/red_circle.png")
          .addChild(new Sprite('mars_moon1', "lab3/gray_circle.png"))
          .addChild(new Sprite('mars_moon2', "lab3/gray_circle.png")))
        .addChild(new Sprite('jupiter', "lab3/green_circle.png")
          .addChild(new Sprite('jupiter_moon1', "lab3/gray_circle.png"))
          .addChild(new Sprite('jupiter_moon2', "lab3/gray_circle.png"))
          .addChild(new Sprite('jupiter_moon3', "lab3/gray_circle.png")))));

    // set immutable properties of bodies
    var root = this.getChild(0) as DisplayObjectContainer;
    root.position = new Vector(this.width/2, this.height/2);
    root.map((obj : DisplayObject) => {
      obj.pivotPoint = new Vector(0.5, 0.5);  // set all objects' pivot points to middle
    });
    DisplayObject.getById('bg').localScale = new Vector(25, 25);
    DisplayObject.getById('mercury').localScale = new Vector(0.25, 0.25);
    DisplayObject.getById('venus').localScale = new Vector(0.3, 0.3);
    DisplayObject.getById('earth').localScale = new Vector(0.35, 0.35);
    DisplayObject.getById('earth_moon').localScale = new Vector(0.6, 0.6);
    DisplayObject.getById('mars').localScale = new Vector(0.35, 0.35);
    DisplayObject.getById('mars_moon1').localScale = new Vector(0.6, 0.6);
    DisplayObject.getById('mars_moon2').localScale = new Vector(0.6, 0.6);
    DisplayObject.getById('jupiter').localScale = new Vector(0.7, 0.7);
    DisplayObject.getById('jupiter_moon1').localScale = new Vector(0.2, 0.2);
    DisplayObject.getById('jupiter_moon2').localScale = new Vector(0.15, 0.15);
    DisplayObject.getById('jupiter_moon3').localScale = new Vector(0.25, 0.25);

    // set up paths of bodies
    this.bodyPaths = [
      { id: 'mercury', startT: 0, period: 2.0, xRadius: 100, yRadius: 100,},
      { id: 'venus', startT: 2.0, period: 3.0, xRadius: 150, yRadius: 175,},
      { id: 'earth', startT: 4.0, period: 3.5, xRadius: 250, yRadius: 225,},
      { id: 'earth_moon', startT: 0, period: 1.0, xRadius: 70, yRadius: 140,},
      { id: 'mars', startT: 3.0, period: 4.0, xRadius: 285, yRadius: 315,},
      { id: 'mars_moon1', startT: Math.PI, period: 1.5, xRadius: 85, yRadius: 125,},
      { id: 'mars_moon2', startT: 0, period: 1.5, xRadius: 125, yRadius: 85,},
      { id: 'jupiter', startT: 5.0, period: 6.5, xRadius: 375, yRadius: 350,},
      { id: 'jupiter_moon1', startT: Math.PI * 2 / 3, period: 2.0, xRadius: 120, yRadius: 105,},
      { id: 'jupiter_moon2', startT: Math.PI * 1 / 3, period: 1.95, xRadius: 95, yRadius: 120,},
      { id: 'jupiter_moon3', startT: 0, period: 2.05, xRadius: 125, yRadius: 95,},
    ];
  }

  update() {
    super.update();
    // Adjust elliptical path of each body
    var time = this.clock.getElapsedTime();
    for (var i = 0; i < this.bodyPaths.length; i++) {
      var config = this.bodyPaths[i];
      DisplayObject.getById(config.id).position = new Vector(
        Math.cos(2 * Math.PI / config.period  * (time / 1000) + config.startT) * config.xRadius,
        Math.sin(2 * Math.PI / config.period  * (time / 1000) + config.startT) * config.yRadius
      );
    }

    // Handle keyboard input
    if (InputHandler.instance.keyHeld(InputKeyCode.Left)) {
      DisplayObject.getById('sun').x -= 3.0;
    }
    if (InputHandler.instance.keyHeld(InputKeyCode.Up)) {
      DisplayObject.getById('sun').y -= 3.0;
    }
    if (InputHandler.instance.keyHeld(InputKeyCode.Right)) {
      DisplayObject.getById('sun').x += 3.0;
    }
    if (InputHandler.instance.keyHeld(InputKeyCode.Down)) {
      DisplayObject.getById('sun').y += 3.0;
    }
    if (InputHandler.instance.keyHeld('q')) {
      DisplayObject.getById('root').localScale = new Vector(
        DisplayObject.getById('root').localScale.x + 0.05,
        DisplayObject.getById('root').localScale.y + 0.05
      ).min(2.0);
    }
    if (InputHandler.instance.keyHeld('w')) {
      DisplayObject.getById('root').localScale = new Vector(
        DisplayObject.getById('root').localScale.x - 0.05,
        DisplayObject.getById('root').localScale.y - 0.05
      ).max(0.5);
    }
    if (InputHandler.instance.keyHeld('a')) {
      DisplayObject.getById('sun').rotation += 3.0;
    }
    if (InputHandler.instance.keyHeld('s')) {
      DisplayObject.getById('sun').rotation -= 3.0;
    }
  }
}

/* Add this game to the canvas  */
var drawingCanvas : HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;
if(drawingCanvas.getContext) {
	var game = new LabThreeGame(drawingCanvas);
	game.start();
}
