"use strict";

import { Game } from '../engine/display/Game';
import { DisplayObject } from '../engine/display/DisplayObject';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { Camera } from '../engine/display/Camera';
import { InputHandler } from '../engine/input/InputHandler';
import { InputKeyCode, InputGamepadButton, InputGamepadAxis } from '../engine/input/InputPrimitives';
import { CallbackManager } from '../engine/events/CallbackManager';
import { TweenManager } from '../engine/tween/TweenManager';
import { Tween } from '../engine/tween/Tween';
import { TweenParam, TweenAttributeType, TweenFunctionType } from '../engine/tween/TweenParam';
import { TweenEventArgs } from '../engine/events/EventTypes';
import { SoundManager } from '../engine/sound/SoundManager';
import { Sprite } from '../engine/display/Sprite';
import { Vector } from '../engine/util/Vector';
import { Physics } from '../engine/util/Physics';

import { PlayerObject } from './PlayerObject';
import { LevelFactory } from './LevelFactory';
import { TriggerZone } from './TriggerZone';
import { MainGameAction, MainGameState, MainGameColor } from './MainGameEnums';
import { TimerUI } from './TimerUI';
import { ScreenTransitionUI } from './ScreenTransitionUI';
import { MenuUI } from './MenuUI';

export class MainGame extends Game {

  public static get IsDebug() : boolean { return false; }

  private rootEnv : DisplayObjectContainer;
  // cameras that contain the two stages and players
  private world1 : Camera;
  private world2 : Camera;
  // player objects
  private player1 : PlayerObject;
  private player2 : PlayerObject;
  // end1 and end2 are trigger zones that indicate player has reached end of level
  private end1 : TriggerZone;
  private end2 : TriggerZone;

  // UI elements
  private timerParent : Sprite;
  private transitionWin : ScreenTransitionUI;
  private transitionLose : ScreenTransitionUI;
  private menu : MenuUI;
  private menuLock : boolean;
  private transitionLock : boolean;
  private gameOverLock : boolean;

  private gameState : MainGameState = MainGameState.MenuOpen;
  private gameLevelNumber : number = 0; // which level players are on
  private gameDuration : number = 100;  // amount of time (seconds) before game over
  private gameSongs : string[] = ['jacket', 'atop', 'ocean', 'distance', 'cake']; // order that songs are played

  constructor (canvas : HTMLCanvasElement) {
    super("Cakewalk Game", 1280, 720, canvas);

    // set up display tree
    var plotScreen : ScreenTransitionUI;
    this.addChild(new DisplayObjectContainer('root', '')
      .addChild(this.rootEnv = new DisplayObjectContainer('root_env', '')
        .addChild(this.world1 = new Camera('world1')
          .addChild(this.player1 = new PlayerObject('player1', 'animations/mario_moving.png', MainGameColor.Red))
          // level environments are inserted here
        ).addChild(this.world2 = new Camera('world2')
          .addChild(this.player2 = new PlayerObject('player2', 'animations/mario_moving_funky.png', MainGameColor.Blue))
          // level environments are inserted here
        )
      ).addChild(new DisplayObjectContainer('root_UI', '')
        .addChild(this.timerParent = new Sprite('timerUIPath', 'CakeWalk/TimerPath.png')
          .addChild(new TimerUI('timerUI', 'animations/StopWatchSprite.png', this.gameDuration,
            new Vector(-10, 0), new Vector(961.5, 0))) // x-values found through trial and error
        ).addChild(this.menu = new MenuUI('menuUI', 'CakeWalk/title.png'))
        .addChild(this.transitionWin = new ScreenTransitionUI('winTransitionUI', 'CakeWalk/win_screen.png'))
        .addChild(this.transitionLose = new ScreenTransitionUI('loseTransitionUI', 'CakeWalk/lose_screen.png'))
        .addChild(plotScreen = new ScreenTransitionUI('plotScreen', 'CakeWalk/plot_screen.png'))
      )
    );

    // root env - hide on start (as menu will show)
    this.rootEnv.visible = false;
    this.rootEnv.active = false;
    // cameras
    this.world1.position = new Vector(0, 0);
    this.world2.position = new Vector(1e6, 1e6); // arbitrarily far away, so 2 worlds do not collide
    this.world1.screenPosition = new Vector(0, 0);
    this.world2.screenPosition = new Vector(0, this.height / 2);
    this.world1.setFocus(0, this.width / 2, this.width);
    this.world2.setFocus(0, this.width / 2, this.width);
    // players
    this.player1.localScale = new Vector(2.0, 2.0);
    this.player2.localScale = new Vector(2.0, 2.0);

    // UI
    this.timerParent.position = new Vector(50, this.height / 2);
    this.timerParent.width = this.width - 100;
    this.timerParent.pivotPoint = new Vector(0.0, 0.5);
    this.timerParent.visible = false;
    this.timerParent.active = false;  // do not show/update timer until level start
    // NOTE references to this.timer are getting type casted first child of timerParent
    this.timer.localScale = new Vector(0.5, 0.5);
    this.timer.pivotPoint = new Vector(0.0, 0.5);
    this.timer.reset();

    var self = this;
    this.menu.registerGameStartCallback(() => {
      // produce a series of events by chaining callbacks
      //  fade out menu, fade in plot screen, wait, fade out plot screen, then start game
      self.menuLock = true;
      var tw : Tween;
      TweenManager.instance.add(tw = new Tween(self.menu)
        .animate(new TweenParam(TweenAttributeType.Alpha, 1.0, 0.0, 1, TweenFunctionType.Linear)));
      tw.addEventListener(TweenEventArgs.ClassName, (args : TweenEventArgs) => {
        if ((args.src as Tween).isComplete) {
          plotScreen.fadeIn(() => {
            CallbackManager.instance.addCallback(() => {
              plotScreen.fadeOut(() => {
                self.menuLock = false;
                self.menu.visible = false;
                self.menu.alpha = 1.0;  // reset alpha and set invisible instead so toggling is easy
                self.menu.setGameStarted();
                self.gameState = MainGameState.InGame;
                self.gameLevelNumber = 0;
                self.loadLevel();
              }, 1);
            }, 5);
          }, 1);
        }
      });
    });

    this.menu.registerGameResumeCallback(() => {
      self.closeMenu();
    });

    // lock vars
    this.menuLock = false;
    this.transitionLock = false;
    this.gameOverLock = false;

    // load all sounds and music
    // NOTE the bg music ids need to match gameSongs
    SoundManager.instance.loadSound('jacket', 'CakeWalk/music/short_skirt_long_jacket.mp3');
    SoundManager.instance.loadSound('atop', 'CakeWalk/music/atop_a_cake.mp3');
    SoundManager.instance.loadSound('ocean', 'CakeWalk/music/cake_by_the_ocean.mp3');
    SoundManager.instance.loadSound('distance', 'CakeWalk/music/the_distance.mp3');
    SoundManager.instance.loadSound('cake', 'CakeWalk/music/cake_martinez.mp3');
    SoundManager.instance.playMusic(this.gameSongs[0]);

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

    if (MainGame.IsDebug) {
      this.menu.visible = false;
      this.menu.setGameStarted();
      this.gameState = MainGameState.InGame;
      this.gameLevelNumber = 0;
      this.loadLevel();
    }
  }

  update(dt : number = 0) : void{
    super.update(dt);

    if (this.gameState == MainGameState.MenuOpen && !this.menuLock) {
      // if pause is pressed in game it closes the menu (second check is a proxy for "environment is loaded")
      if (this.getActionInput(MainGameAction.Pause) > 0 && this.world1.children.length > 1) {
        this.closeMenu();
      }
      if (this.getActionInput(MainGameAction.MenuConfirm) > 0) {
        this.menu.menuAction();
      } else if (this.getActionInput(MainGameAction.MenuUp) > 0) {
        this.menu.menuScroll(false);
      } else if (this.getActionInput(MainGameAction.MenuDown) > 0) {
        this.menu.menuScroll(true);
      }
    } else if (this.gameState == MainGameState.EndGameLoss && !this.transitionLock) {
      if (this.getActionInput(MainGameAction.EndGameContinue) > 0) {
        this.transitionLock = true;
        var self = this;
        this.transitionLose.fadeOut(() => {
          self.loadLevel(); // load same level
          self.gameState = MainGameState.InGame;
          self.transitionLock = false;
        }, 1.0);
      }
    } else if (this.gameState == MainGameState.EndGameWin && !this.transitionLock) {
      if (this.getActionInput(MainGameAction.EndGameContinue) > 0) {
        this.transitionLock = true;
        var self = this;
        self.gameLevelNumber += 1;
        this.transitionWin.fadeOut(() => {
          self.loadLevel(); // load next level
          self.gameState = MainGameState.InGame;
          self.transitionLock = false;
        }, 1.0);
        SoundManager.instance.fadeToNext(this.gameSongs[this.gameLevelNumber % this.gameSongs.length], 1.0);
      }
    } else if (this.gameState == MainGameState.InGame) {
      // handle input

      // player 1 running and jumping
      this.player1.run(this.getActionInput(MainGameAction.PlayerOneRun));
      if (this.getActionInput(MainGameAction.PlayerOneJump) > 0) {
        this.player1.jump();
      } else if (this.getActionInput(MainGameAction.PlayerOneJumpStop) > 0) {
        this.player1.cancelJump();
      }

      // player 2 running and jumping
      this.player2.run(this.getActionInput(MainGameAction.PlayerTwoRun));
      if (this.getActionInput(MainGameAction.PlayerTwoJump) > 0) {
        this.player2.jump();
      } else if (this.getActionInput(MainGameAction.PlayerTwoJumpStop) > 0) {
        this.player2.cancelJump();
      }

      // player swapping
      if (!this.gameOverLock && this.player1.isAlive && this.player2.isAlive) {
        var doSwap = false;
        if (this.getActionInput(MainGameAction.PlayerOneSwap) > 0 && this.player1.canSwap) {
          this.player1.didSwap();
          doSwap = true;
        } else if (this.getActionInput(MainGameAction.PlayerTwoSwap) > 0 && this.player2.canSwap) {
          this.player2.didSwap();
          doSwap = true;
        }
        if (doSwap) {
          // swap player attributes
          var tmp = this.player1.position;
          this.player1.position = this.player2.position;
          this.player2.position = tmp;
          tmp = this.player1.previousPosition;
          this.player1.previousPosition = this.player2.previousPosition;
          this.player2.previousPosition = tmp;
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
      }

      // opening pause menu
      if (!this.gameOverLock && this.getActionInput(MainGameAction.Pause) > 0) {
        this.openMenu();
      }

      // check for endgame state
      if (!this.gameOverLock) {
        // if timer is finished, players lose
        // if both players are alive and in end zone, they win
        if (this.timer.isFinished) {
          this.gameOverLock = true;
          var self = this;
          this.transitionLose.fadeIn(() => {
            self.rootEnv.active = false;
            self.timerParent.active = false;
            self.gameState = MainGameState.EndGameLoss
            self.gameOverLock = false;
          }, 2.0);
        } else if (this.end1.isPlayerInZone && this.end2.isPlayerInZone
            && this.player1.isAlive && this.player2.isAlive) {
          this.gameOverLock = true;
          var self = this;
          this.transitionWin.fadeIn(() => {
            self.rootEnv.active = false;
            self.timerParent.active = false;
            self.gameState = MainGameState.EndGameWin
            self.gameOverLock = false;
          }, 2.0);
        }
      }

      // apply global physics
      this.player1.addForce(Physics.Gravity.multiply(this.player1.mass));
      this.player2.addForce(Physics.Gravity.multiply(this.player2.mass));
    }
  }

  private loadLevel() {
    // insert new environment into display tree
    var levelParams = LevelFactory.GetLevel(this.gameLevelNumber);
    this.world1.setChild(levelParams.topLevel, 1);
    this.world2.setChild(levelParams.bottomLevel, 1);
    this.end1 = levelParams.topEndZone;
    this.end2 = levelParams.bottomEndZone;

    // set player and camera positions
    this.world1.setChild(this.player1, 0);
    this.world2.setChild(this.player2, 0);
    this.player1.position = this.player1.respawnPoint = levelParams.topStartPoint;
    this.player2.position = this.player2.respawnPoint = levelParams.bottomStartPoint;
    this.world1.screenPosition.x = -(this.player1.position.x - this.width / 2);
    this.world2.screenPosition.x = -(this.player2.position.x - this.width / 2);
    this.world1.setXBounds(levelParams.topXBounds[0], levelParams.topXBounds[1]);
    this.world2.setXBounds(levelParams.bottomXBounds[0], levelParams.bottomXBounds[1]);

    // reset elements
    this.timer.reset();
    this.timer.gameDuration = levelParams.gameDuration;
    this.player1.reset();
    this.player2.reset();
    this.rootEnv.active = this.rootEnv.visible = true;
    this.timerParent.active = this.timerParent.visible = true;
  }

  openMenu() : void {
    this.menu.visible = true;
    this.rootEnv.active = false;
    this.timerParent.active = false;
    this.pauseGlobalUpdates();
    this.gameState = MainGameState.MenuOpen;
  }

  closeMenu() : void {
    this.menu.reset();
    this.menu.visible = false;
    this.rootEnv.active = true;
    this.timerParent.active = true;
    this.resumeGlobalUpdates();
    this.gameState = MainGameState.InGame;
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
    } else if (action == MainGameAction.Pause) {
        return (InputHandler.instance.gamepadButtonDown(0, InputGamepadButton.Start)
          || InputHandler.instance.gamepadButtonDown(1, InputGamepadButton.Start)
          || InputHandler.instance.keyDown(InputKeyCode.Escape)) ? 1 : 0;
    } else if (action == MainGameAction.EndGameContinue) {
        return (InputHandler.instance.gamepadButtonDown(0, InputGamepadButton.A)
          || InputHandler.instance.gamepadButtonDown(0, InputGamepadButton.X)
          || InputHandler.instance.gamepadButtonDown(0, InputGamepadButton.Start)
          || InputHandler.instance.gamepadButtonDown(1, InputGamepadButton.A)
          || InputHandler.instance.gamepadButtonDown(1, InputGamepadButton.X)
          || InputHandler.instance.gamepadButtonDown(1, InputGamepadButton.Start)
          || InputHandler.instance.keyDown(InputKeyCode.Return)
          || InputHandler.instance.keyDown(InputKeyCode.Space)) ? 1 : 0;
    } else if (action == MainGameAction.MenuConfirm) {
      if (InputHandler.instance.gamepadPresent(0) || InputHandler.instance.gamepadPresent(1)) {
        return (InputHandler.instance.gamepadButtonDown(0, InputGamepadButton.A)
          || InputHandler.instance.gamepadButtonDown(1, InputGamepadButton.A)) ? 1 : 0;
      } else {
        return (InputHandler.instance.keyDown(InputKeyCode.Return)
          || InputHandler.instance.keyDown(InputKeyCode.Space))? 1 : 0;
      }
    } else if (action == MainGameAction.MenuUp) {
      if (InputHandler.instance.gamepadPresent(0) || InputHandler.instance.gamepadPresent(1)) {
        return (InputHandler.instance.gamepadButtonDown(0, InputGamepadButton.DpadUp)
          || InputHandler.instance.gamepadButtonDown(1, InputGamepadButton.DpadUp)) ? 1 : 0;
      } else {
        return InputHandler.instance.keyDown(InputKeyCode.Up) ? 1 : 0;
      }
    } else if (action == MainGameAction.MenuDown) {
      if (InputHandler.instance.gamepadPresent(0) || InputHandler.instance.gamepadPresent(1)) {
        return (InputHandler.instance.gamepadButtonDown(0, InputGamepadButton.DpadDown)
          || InputHandler.instance.gamepadButtonDown(1, InputGamepadButton.DpadDown)) ? 1 : 0;
      } else {
        return InputHandler.instance.keyDown(InputKeyCode.Down) ? 1 : 0;
      }
    }
    return 0;
  }

  private get timer() : TimerUI {
    return this.timerParent.getChild(0) as TimerUI;
  }
}

/* Add this game to the canvas  */
var drawingCanvas : HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;
if(drawingCanvas.getContext) {
	var game = new MainGame(drawingCanvas);
	game.start();
}
