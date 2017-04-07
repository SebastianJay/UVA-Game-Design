"use strict";

import { Game } from '../engine/display/Game';
import { DisplayObject } from '../engine/display/DisplayObject';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { Camera } from '../engine/display/Camera';
import { InputHandler } from '../engine/input/InputHandler';
import { InputKeyCode, InputGamepadButton, InputGamepadAxis } from '../engine/input/InputPrimitives';
import { Sprite } from '../engine/display/Sprite';
import { Vector } from '../engine/util/Vector';
import { Physics } from '../engine/util/Physics';

import { PlayerObject } from './PlayerObject';
import { Platform } from './Platform';
import { MainGameActions } from './MainGameActions';
import { MainGameStates } from './MainGameStates';
import { TimerUI } from './TimerUI';
import { ScreenTransitionUI } from './ScreenTransitionUI';

export class MainGame extends Game {

  private world1 : Camera;
  private world2 : Camera;
  private player1 : PlayerObject;
  private player2 : PlayerObject;
  private timer : TimerUI;
  private screenTransition : ScreenTransitionUI

  private gameState : MainGameStates = MainGameStates.InGame;
  private gameDuration : number = 10;  // amount of time before game over

  constructor (canvas : HTMLCanvasElement) {
    super("Cakewalk Game", 1280, 720, canvas);

    // set up display tree
    var p1, p2;
    //b1start b1end etc are invisible walls at the begining and end of level
    var b1start, b2start, b1end, b2end;
    //b1a and b2a are blocks to jump over
    var b1a, b2a;
    this.addChild(new DisplayObjectContainer('root', '')
      .addChild(new DisplayObjectContainer('root_env', '')
        .addChild(this.world1 = new Camera('world1')
          .addChild(this.player1 = new PlayerObject('player1', 'animations/mario_moving.png', 0))
          .addChild(b1start = new Platform('brick1start', 'lab5/brick.png'))
          .addChild(b1end = new Platform('brick1end', 'lab5/brick.png'))
          .addChild(b1a = new Platform('brick1a', 'CakeWalk/YellowCake.png'))
          .addChild(p1 = new Platform('platform1', 'CakeWalk/tableCombined.png')) as Camera)
        .addChild(this.world2 = new Camera('world2')
          .addChild(this.player2 = new PlayerObject('player2', 'animations/mario_moving_funky.png', 1))
          .addChild(b2start = new Platform('brick2end', 'lab5/brick.png'))
          .addChild(b2end = new Platform('brick2end', 'lab5/brick.png'))
          .addChild(b2a = new Platform('brick2a', 'CakeWalk/cake2.png'))
          .addChild(p2 = new Platform('platform2', 'CakeWalk/tableCombined.png')) as Camera)
        )
      .addChild(new DisplayObjectContainer('root_UI', ''))
        .addChild(this.timer = new TimerUI('timerui', 'CakeWalk/cake2.png', this.gameDuration,
          new Vector(50, this.height / 2), new Vector(this.width - 50, this.height / 2)))
        .addChild(this.screenTransition = new ScreenTransitionUI('transitionui', 'CakeWalk/black_square.png'))
      );

    this.world1.position = new Vector(0, 0);
    this.world2.position = new Vector(1e6, 1e6); // arbitrarily far away, so 2 worlds do not collide
    this.world1.screenPosition = new Vector(0, 0);
    this.world2.screenPosition = new Vector(0, this.height / 2);
    this.world1.setFocus(0, this.width / 2, this.width);
    this.world2.setFocus(0, this.width / 2, this.width);
    this.player1.position = new Vector(50, 50);
    this.player2.position = new Vector(50, 50);
    p1.position = new Vector(0, 200);
    p1.width = this.width * 2;
    p2.position = new Vector(0, 200);
    p2.width = this.width * 2;
    this.player1.localScale = new Vector(2.0, 2.0);
    this.player2.localScale = new Vector(2.0, 2.0);
    p1.localScale = new Vector(3.0, 0.3);
    p2.localScale = new Vector(3.0, 0.3);
    b1start.position = new Vector(-50,0);
    b1start.localScale = new Vector(1.0, 100.0);
    b1start.visible = false;
    b1end.position = new Vector(2400,0);
    b1end.localScale = new Vector(1.0, 100.0);
    b1end.visible = false;
    b2start.position = new Vector(-50,0);
    b2start.localScale = new Vector(1.0, 100.0);
    b2start.visible = false;
    b2end.position = new Vector(2400,0);
    b2end.localScale = new Vector(1.0, 100.0);
    b2end.visible = false;
    b1a.position = new Vector(1500,120);
    b2a.position = new Vector(500,120);
    b1a.localScale = new Vector (0.3, 0.3);
    b2a.localScale = new Vector (0.6, 0.6);
    this.timer.pivotPoint = new Vector(0.5, 0.5);
    this.timer.localScale = new Vector(0.4, 0.4);
    this.screenTransition.position = new Vector(this.width / 2, this.height / 2);
    this.screenTransition.dimensions = new Vector(this.width, this.height);
    this.screenTransition.pivotPoint = new Vector(0.5, 0.5);
    Physics.SetCollisionMat(0, 1);  // check collisions between player and platforms
  }

  update() {
    super.update();

    if (this.gameState == MainGameStates.EndGameLoss) {
      if (this.getActionInput(MainGameActions.EndGameContinue) > 0) {
        if (!this.screenTransition.isFading) {
          var self = this;
          this.screenTransition.fadeOut(1.0, () => {
            self.gameState = MainGameStates.InGame;
            self.timer.reset();
          });
        }
      }
    } else if (this.gameState == MainGameStates.InGame) {
      // handle input
      this.player1.run(this.getActionInput(MainGameActions.PlayerOneRun));
      if (this.getActionInput(MainGameActions.PlayerOneJump) > 0) {
        this.player1.jump();
      } else if (this.getActionInput(MainGameActions.PlayerOneJumpStop) > 0) {
        this.player1.cancelJump();
      }

      this.player2.run(this.getActionInput(MainGameActions.PlayerTwoRun));
      if (this.getActionInput(MainGameActions.PlayerTwoJump) > 0) {
        this.player2.jump();
      } else if (this.getActionInput(MainGameActions.PlayerTwoJumpStop) > 0) {
        this.player2.cancelJump();
      }

      if (this.getActionInput(MainGameActions.PlayerOneSwap) > 0 || this.getActionInput(MainGameActions.PlayerTwoSwap)) {
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

      // check for endgame state
      //  screenTransition.isFading used as proxy for whether state is about to change
      if (!this.screenTransition.isFading) {
        if (this.timer.isFinished) {
          var self = this;
          this.screenTransition.fadeIn(2.0, () => {
            self.gameState = MainGameStates.EndGameLoss
          });
        }
      }

      // apply global physics
      this.player1.addForce(Physics.Gravity.multiply(this.player1.mass));
      this.player2.addForce(Physics.Gravity.multiply(this.player2.mass));
    }
  }

  /**
   * Retrieves player input for a given action, discerning between gamepad and keyboard.
   * For buttons, returns 1 if pressed and 0 if not. For axes, returns a range between -1 and 1
   */
  private getActionInput(action : MainGameActions) : number {
    if (action == MainGameActions.PlayerOneRun) {
      if (InputHandler.instance.gamepadPresent(0)) {
        return InputHandler.instance.gamepadAxis(0, InputGamepadAxis.LeftHorizontal);
      } else {
        return InputHandler.instance.keyHeld(InputKeyCode.Left) != InputHandler.instance.keyHeld(InputKeyCode.Right)
          ? (InputHandler.instance.keyHeld(InputKeyCode.Left) ? -1 : 1) : 0;
      }
    } else if (action == MainGameActions.PlayerOneJump) {
      if (InputHandler.instance.gamepadPresent(0)) {
        return InputHandler.instance.gamepadButtonDown(0, InputGamepadButton.A) ? 1 : 0;
      } else {
        return InputHandler.instance.keyDown(InputKeyCode.Up) ? 1 : 0;
      }
    } else if (action == MainGameActions.PlayerOneJumpStop) {
      if (InputHandler.instance.gamepadPresent(0)) {
        return InputHandler.instance.gamepadButtonUp(0, InputGamepadButton.A) ? 1 : 0;
      } else {
        return InputHandler.instance.keyUp(InputKeyCode.Up) ? 1 : 0;
      }
    } else if (action == MainGameActions.PlayerOneSwap) {
      if (InputHandler.instance.gamepadPresent(0)) {
        return InputHandler.instance.gamepadButtonDown(0, InputGamepadButton.X) ? 1 : 0;
      } else {
        return InputHandler.instance.keyDown(InputKeyCode.Return) ? 1 : 0;
      }
    } else if (action == MainGameActions.PlayerTwoRun) {
      if (InputHandler.instance.gamepadPresent(1)) {
        return InputHandler.instance.gamepadAxis(1, InputGamepadAxis.LeftHorizontal);
      } else {
        return InputHandler.instance.keyHeld('A') != InputHandler.instance.keyHeld('D')
          ? (InputHandler.instance.keyHeld('A') ? -1 : 1) : 0;
      }
    } else if (action == MainGameActions.PlayerTwoJump) {
      if (InputHandler.instance.gamepadPresent(1)) {
        return InputHandler.instance.gamepadButtonDown(1, InputGamepadButton.A) ? 1 : 0;
      } else {
        return InputHandler.instance.keyDown('W') ? 1 : 0;
      }
    } else if (action == MainGameActions.PlayerTwoJumpStop) {
      if (InputHandler.instance.gamepadPresent(1)) {
        return InputHandler.instance.gamepadButtonUp(1, InputGamepadButton.A) ? 1 : 0;
      } else {
        return InputHandler.instance.keyUp('W') ? 1 : 0;
      }
    } else if (action == MainGameActions.PlayerTwoSwap) {
      if (InputHandler.instance.gamepadPresent(1)) {
        return InputHandler.instance.gamepadButtonDown(1, InputGamepadButton.X) ? 1 : 0;
      } else {
        return InputHandler.instance.keyDown(InputKeyCode.Space) ? 1 : 0;
      }
    } else if (action == MainGameActions.EndGameContinue) {
      if (InputHandler.instance.gamepadPresent(0)) {
        return InputHandler.instance.gamepadButtonDown(0, InputGamepadButton.A) ? 1 : 0;
      } else {
        return InputHandler.instance.keyDown(InputKeyCode.Space) ? 1 : 0;
      }
    }
    return 0;
  }
}

/* Add this game to the canvas  */
var drawingCanvas : HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;
if(drawingCanvas.getContext) {
	var game = new MainGame(drawingCanvas);
	game.start();
}
