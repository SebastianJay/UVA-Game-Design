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
import { Gate } from './Gate';
import { Switch } from './Switch';
import { Flame } from './Flame';
import { MainGameAction, MainGameState, MainGameColor } from './MainGameEnums';
import { TimerUI } from './TimerUI';
import { ScreenTransitionUI } from './ScreenTransitionUI';

export class MainGame extends Game {

  private world1 : Camera;
  private world2 : Camera;
  private player1 : PlayerObject;
  private player2 : PlayerObject;
  private timer : TimerUI;
  private screenTransition : ScreenTransitionUI

  private gameState : MainGameState = MainGameState.InGame;
  private gameDuration : number = 100;  // amount of time (seconds) before game over

  constructor (canvas : HTMLCanvasElement) {
    super("Cakewalk Game", 1280, 720, canvas);

    // set up display tree
    var p1, p2;
    //b1start b1end etc are invisible walls at the begining and end of level
    var b1start, b2start, b1end, b2end;
    //c1b and c2b are candles to jump over
    //naming convention: object, world, order
    //object: c = candle, f = flame, g = gate, s = switch
    //world: 1 = world 1, 2 = world 2
    //order: from leftmost to right most type of that object a,b,c, etc.  after z it will go aa, ab, ac
    var c1a, c1b, c1c, c1d, c1e, c1f, c1g;
    var c2a, c2b, c2c, c2d, c2e, c2f, c2g;
    var f1a, f1b, f1c, f1d, f1e, f1f, f1g, f1h, f1i, f1j, f1k, f1l, f1m, f1n, f1o, f1p;
    var f2a, f2b, f2c, f2d, f2e, f2f, f2g, f2h, f2i, f2j, f2k, f2l, f2m, f2n, f2o, f2p;
    var g1a, g1b;
    var s1a;
    var g2a;
    var s2a, s2b;
    var timerPath;
    this.addChild(new DisplayObjectContainer('root', '')
      .addChild(new DisplayObjectContainer('root_env', '')
        .addChild(this.world1 = new Camera('world1')
          .addChild(this.player1 = new PlayerObject('player1', 'animations/mario_moving.png', MainGameColor.Red))
          .addChild(new DisplayObjectContainer('env1', '')
            .addChild(b1start = new Platform('brick1start', 'lab5/brick.png'))
            .addChild(b1end = new Platform('brick1end', 'lab5/brick.png'))
            .addChild(c1a = new Platform('candle1a', 'CakeWalk/YellowCandle.png'))
            .addChild(c1b = new Platform('candle1b', 'CakeWalk/RedCandle.png', MainGameColor.Red))
            .addChild(c1c = new Platform('candle1c', 'CakeWalk/BlueCandle.png', MainGameColor.Blue))
            .addChild(c1d = new Platform('candle1d', 'CakeWalk/BlueCandle.png', MainGameColor.Blue))
            .addChild(c1e = new Platform('candle1e', 'CakeWalk/RedCandle.png', MainGameColor.Red))
            .addChild(c1f = new Platform('candle1f', 'CakeWalk/BlueCandle.png', MainGameColor.Blue))
            .addChild(s1a = new Switch('switch1a', 'CakeWalk/RedButton.png', MainGameColor.Red)) //TODO make this button red
            .addChild(g1a = new Gate('gate1a', 'CakeWalk/YellowCandle.png'))
            .addChild(g1b = new Gate('gate1b', 'CakeWalk/YellowCandle.png'))
            .addChild(p1 = new Platform('platform1a', 'CakeWalk/tableCombined.png'))
            .addChild(f1a = new Flame('flame1a', 'animations/YellowFlameSprite.png')) // should be yellow
            .addChild(f1b = new Flame('flame1b', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f1c = new Flame('flame1c', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f1d = new Flame('flame1d', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f1e = new Flame('flame1e', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f1f = new Flame('flame1f', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f1g = new Flame('flame1g', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f1h = new Flame('flame1h', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f1i = new Flame('flame1i', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f1j = new Flame('flame1j', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f1k = new Flame('flame1k', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f1l = new Flame('flame1l', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f1m = new Flame('flame1m', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f1n = new Flame('flame1n', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f1o = new Flame('flame1o', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f1p = new Flame('flame1p', 'animations/RedFlameSprite.png', MainGameColor.Red))
          ) as Camera)
        .addChild(this.world2 = new Camera('world2')
          .addChild(this.player2 = new PlayerObject('player2', 'animations/mario_moving_funky.png', MainGameColor.Blue))
          .addChild(new DisplayObjectContainer('env2', '')
            .addChild(b2start = new Platform('brick2end', 'lab5/brick.png'))
            .addChild(b2end = new Platform('brick2end', 'lab5/brick.png'))
            .addChild(c2a = new Platform('candle1a', 'CakeWalk/YellowCandle.png'))
            .addChild(c2b = new Platform('candle2b', 'CakeWalk/BlueCandle.png', MainGameColor.Blue))
            .addChild(c2c = new Platform('candle2c', 'CakeWalk/RedCandle.png', MainGameColor.Red))
            .addChild(c2d = new Platform('candle2d', 'CakeWalk/RedCandle.png', MainGameColor.Red))
            .addChild(c2e = new Platform('candle2e', 'CakeWalk/BlueCandle.png', MainGameColor.Blue))
            .addChild(c2f = new Platform('candle2f', 'CakeWalk/RedCandle.png', MainGameColor.Red))
            .addChild(g2a = new Gate('gate2a', 'CakeWalk/YellowCandle.png'))
            .addChild(s2a = new Switch('switch2a', 'CakeWalk/BlueButton.png', MainGameColor.Blue))
            .addChild(s2b = new Switch('switch2b', 'CakeWalk/BlueButton.png', MainGameColor.Blue))
            .addChild(p2 = new Platform('platform2', 'CakeWalk/tableCombined.png'))
            .addChild(f2a = new Flame('flame2a', 'animations/YellowFlameSprite.png')) // should be yellow
            .addChild(f2b = new Flame('flame2b', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f2c = new Flame('flame2c', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f2d = new Flame('flame2d', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f2e = new Flame('flame2e', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f2f = new Flame('flame2f', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f2g = new Flame('flame2g', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f2h = new Flame('flame2h', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f2i = new Flame('flame2i', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f2j = new Flame('flame2j', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f2k = new Flame('flame2k', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f2l = new Flame('flame2l', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f2m = new Flame('flame2m', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f2n = new Flame('flame2n', 'animations/BlueFlameSprite.png', MainGameColor.Blue))
            .addChild(f2o = new Flame('flame2o', 'animations/RedFlameSprite.png', MainGameColor.Red))
            .addChild(f2p = new Flame('flame2p', 'animations/BlueFlameSprite.png', MainGameColor.Blue))


          ) as Camera)
        )
      .addChild(new DisplayObjectContainer('root_UI', ''))
        .addChild(timerPath = new TimerUI('timerUIPath', 'animations/TimerPath.png', this.gameDuration,
          new Vector(50, this.height / 2.5), new Vector(50, this.height / 2.5)))
        .addChild(this.timer = new TimerUI('timerui', 'animations/StopWatchSprite.png', this.gameDuration,
          new Vector(50, this.height / 2.3), new Vector(this.width - 50, this.height / 2.3)))
        .addChild(this.screenTransition = new ScreenTransitionUI('transitionui', 'CakeWalk/black_square.png'))
      );

    this.world1.position = new Vector(0, 0);
    this.world2.position = new Vector(1e6, 1e6); // arbitrarily far away, so 2 worlds do not collide
    this.world1.screenPosition = new Vector(0, 0);
    this.world2.screenPosition = new Vector(0, this.height / 2);
    this.world1.setFocus(0, this.width / 2, this.width);
    this.world2.setFocus(0, this.width / 2, this.width);
    this.player1.position = this.player1.respawnPoint = new Vector(50, 50);
    this.player2.position = this.player2.respawnPoint = new Vector(50, 50);
    p1.position = new Vector(0, 200);
    p1.width = this.width * 2.5;
    p2.position = new Vector(0, 200);
    p2.width = this.width * 2.5;
    this.player1.localScale = new Vector(2.0, 2.0);
    this.player2.localScale = new Vector(2.0, 2.0);
    p1.localScale = new Vector(3.0, 0.3);
    p2.localScale = new Vector(3.0, 0.3);
    b1start.position = new Vector(-50,0);
    b1start.localScale = new Vector(1.0, 100.0);
    b1start.visible = false;
    b1end.position = new Vector(3000,0);
    b1end.localScale = new Vector(1.0, 100.0);
    b1end.visible = false;
    b2start.position = new Vector(-50,0);
    b2start.localScale = new Vector(1.0, 100.0);
    b2start.visible = false;
    b2end.position = new Vector(3000,0);
    b2end.localScale = new Vector(1.0, 100.0);
    b2end.visible = false;
    //first obstacle
    c1a.position = new Vector(250,140);
    c2a.position = new Vector(250,140);
    //second obstacle
    f1a.position = new Vector(600, 140);
    f2a.position = new Vector(600, 140);
    //third obstacle
    c1b.position = new Vector(900,100);
    c2b.position = new Vector(900,100);
    //fourth obstacle
    c1c.position = new Vector(1100,100);
    c2c.position = new Vector(1100,100);
    //fifth obstacle
    f1b.position = new Vector(1300, 140);
    f1c.position = new Vector(1350, 140);
    f1d.position = new Vector(1400, 140);
    f1e.position = new Vector(1450, 140);
    f1f.position = new Vector(1500, 140);
    f1g.position = new Vector(1550, 140);
    f2b.position = new Vector(1300, 140);
    f2c.position = new Vector(1350, 140);
    f2d.position = new Vector(1400, 140);
    f2e.position = new Vector(1450, 140);
    f2f.position = new Vector(1500, 140);
    f2g.position = new Vector(1550, 140);
    //sixth obstacle
    f1h.position = new Vector(1700, 140);
    f1i.position = new Vector(1750, 140);
    f1j.position = new Vector(1800, 140);
    f1k.position = new Vector(1850, 140);
    f1l.position = new Vector(1900, 140);
    f1m.position = new Vector(1950, 140);
    f2h.position = new Vector(1700, 140);
    f2i.position = new Vector(1750, 140);
    f2j.position = new Vector(1800, 140);
    f2k.position = new Vector(1850, 140);
    f2l.position = new Vector(1900, 140);
    f2m.position = new Vector(1950, 140);
    //seventh obstacle
    g1a.restPosition = g1a.position = new Vector(2200, 80);
    g1a.targetPosition = g1a.position.add(new Vector(0, -150));
    s2a.position = new Vector(2200, 170);
    s2a.localScale = new Vector(0.3, 0.3);
    g1a.syncSwitch(s2a);
    //eighth obstacle
    c1d.position = new Vector(2400,150);
    c1e.position = new Vector(2450,100);
    c1f.position = new Vector(2500,50);
    c2d.position = new Vector(2400,150);
    c2e.position = new Vector(2450,100);
    c2f.position = new Vector(2500,70);
    f1n.position = new Vector(2400,160);
    f1o.position = new Vector(2450,110);
    f1p.position = new Vector(2500,60);
    f2n.position = new Vector(2400,160);
    f2o.position = new Vector(2450,110);
    f2p.position = new Vector(2500,60);
    g1b.restPosition = g1b.position = new Vector(2550, -20);
    g1b.targetPosition = g1b.position.add(new Vector(0, -550));
    s2b.position = new Vector(2500, 50);
    s2b.localScale = new Vector(0.3, 0.3);
    g1b.syncSwitch(s2b);
    g2a.restPosition = g2a.position = new Vector(2550, -20);
    g2a.targetPosition = g2a.position.add(new Vector(0, 550));
    s1a.position = new Vector(2700, 170);
    s1a.localScale = new Vector(0.3, 0.3);
    g2a.syncSwitch(s1a);
    // c1b.localScale = new Vector (0.3, 0.3);
    // c2b.localScale = new Vector (0.6, 0.6);

    this.timer.pivotPoint = new Vector(0.5, 0.5);
    this.timer.localScale = new Vector(0.5, 0.5);
    timerPath.width = this.width - 50;
    this.screenTransition.position = new Vector(this.width / 2, this.height / 2);
    this.screenTransition.dimensions = new Vector(this.width, this.height);
    this.screenTransition.pivotPoint = new Vector(0.5, 0.5);

    // create collision matrix
    // 0 - neutral objects that collide both players
    // 1 - red objects that pass through player red
    // 2 - blue objects that pass through player blue
    // 3 - player red
    // 4 - player blue
    Physics.SetCollisionMat(0, 3);
    Physics.SetCollisionMat(0, 4);
    Physics.SetCollisionMat(1, 4);
    Physics.SetCollisionMat(2, 3);
  }

  update() {
    super.update();

    if (this.gameState == MainGameState.EndGameLoss) {
      if (this.getActionInput(MainGameAction.EndGameContinue) > 0) {
        if (!this.screenTransition.isFading) {
          var self = this;
          this.screenTransition.fadeOut(1.0, () => {
            self.gameState = MainGameState.InGame;
            self.timer.reset();
          });
        }
      }
    } else if (this.gameState == MainGameState.InGame) {
      // handle input
      this.player1.run(this.getActionInput(MainGameAction.PlayerOneRun));
      if (this.getActionInput(MainGameAction.PlayerOneJump) > 0) {
        this.player1.jump();
      } else if (this.getActionInput(MainGameAction.PlayerOneJumpStop) > 0) {
        this.player1.cancelJump();
      }

      this.player2.run(this.getActionInput(MainGameAction.PlayerTwoRun));
      if (this.getActionInput(MainGameAction.PlayerTwoJump) > 0) {
        this.player2.jump();
      } else if (this.getActionInput(MainGameAction.PlayerTwoJumpStop) > 0) {
        this.player2.cancelJump();
      }

      if (this.getActionInput(MainGameAction.PlayerOneSwap) > 0 || this.getActionInput(MainGameAction.PlayerTwoSwap) > 0) {
        // swap player attributes
        var tmp = this.player1.position;
        this.player1.position = this.player2.position;
        this.player2.position = tmp;
        tmp = this.player1.velocity;
        this.player1.velocity = this.player2.velocity;
        this.player2.velocity = tmp;
        tmp = this.player1.respawnPoint;
        this.player1.respawnPoint = this.player2.respawnPoint;
        this.player2.respawnPoint = tmp;

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
            self.gameState = MainGameState.EndGameLoss
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
  private getActionInput(action : MainGameAction) : number {
    if (action == MainGameAction.PlayerOneRun) {
      if (InputHandler.instance.gamepadPresent(0)) {
        return InputHandler.instance.gamepadAxis(0, InputGamepadAxis.LeftHorizontal);
      } else {
        return InputHandler.instance.keyHeld(InputKeyCode.Left) != InputHandler.instance.keyHeld(InputKeyCode.Right)
          ? (InputHandler.instance.keyHeld(InputKeyCode.Left) ? -1 : 1) : 0;
      }
    } else if (action == MainGameAction.PlayerOneJump) {
      if (InputHandler.instance.gamepadPresent(0)) {
        return InputHandler.instance.gamepadButtonDown(0, InputGamepadButton.A) ? 1 : 0;
      } else {
        return InputHandler.instance.keyDown(InputKeyCode.Up) ? 1 : 0;
      }
    } else if (action == MainGameAction.PlayerOneJumpStop) {
      if (InputHandler.instance.gamepadPresent(0)) {
        return InputHandler.instance.gamepadButtonUp(0, InputGamepadButton.A) ? 1 : 0;
      } else {
        return InputHandler.instance.keyUp(InputKeyCode.Up) ? 1 : 0;
      }
    } else if (action == MainGameAction.PlayerOneSwap) {
      if (InputHandler.instance.gamepadPresent(0)) {
        return InputHandler.instance.gamepadButtonDown(0, InputGamepadButton.X) ? 1 : 0;
      } else {
        return InputHandler.instance.keyDown(InputKeyCode.Return) ? 1 : 0;
      }
    } else if (action == MainGameAction.PlayerTwoRun) {
      if (InputHandler.instance.gamepadPresent(1)) {
        return InputHandler.instance.gamepadAxis(1, InputGamepadAxis.LeftHorizontal);
      } else {
        return InputHandler.instance.keyHeld('A') != InputHandler.instance.keyHeld('D')
          ? (InputHandler.instance.keyHeld('A') ? -1 : 1) : 0;
      }
    } else if (action == MainGameAction.PlayerTwoJump) {
      if (InputHandler.instance.gamepadPresent(1)) {
        return InputHandler.instance.gamepadButtonDown(1, InputGamepadButton.A) ? 1 : 0;
      } else {
        return InputHandler.instance.keyDown('W') ? 1 : 0;
      }
    } else if (action == MainGameAction.PlayerTwoJumpStop) {
      if (InputHandler.instance.gamepadPresent(1)) {
        return InputHandler.instance.gamepadButtonUp(1, InputGamepadButton.A) ? 1 : 0;
      } else {
        return InputHandler.instance.keyUp('W') ? 1 : 0;
      }
    } else if (action == MainGameAction.PlayerTwoSwap) {
      if (InputHandler.instance.gamepadPresent(1)) {
        return InputHandler.instance.gamepadButtonDown(1, InputGamepadButton.X) ? 1 : 0;
      } else {
        return InputHandler.instance.keyDown(InputKeyCode.Space) ? 1 : 0;
      }
    } else if (action == MainGameAction.EndGameContinue) {
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
