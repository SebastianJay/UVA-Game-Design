"use strict";

import { DisplayObject } from '../engine/display/DisplayObject';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { TiledSpriteContainer } from '../engine/display/TiledSpriteContainer';
import { Sprite } from '../engine/display/Sprite';
import { Vector } from '../engine/util/Vector';

import { Platform } from './Platform';
import { Gate } from './Gate';
import { TimedGate } from './TimedGate';
import { Switch } from './Switch';
import { Flame } from './Flame';
import { TriggerZone } from './TriggerZone';
import { Checkpoint } from './Checkpoint';
import { MainGameAction, MainGameState, MainGameColor } from './MainGameEnums';

/**
 * Contains parameters needed to start up a new level. Top and bottom screens have separate params:
 *  level: the display tree containing the environmental objects
 *  startPoint: the position to start the player at
 *  endZone : reference to TriggerZone in level that is the end of the stage
 *  xBounds : two-tuple of min and max x values (respectively) to hold the camera within
 * gameDuration is time in seconds to complete the level
 */
export interface LevelParams {
  topLevel: DisplayObjectContainer;
  topStartPoint: Vector;
  topEndZone: TriggerZone;
  topXBounds: [number, number];

  bottomLevel: DisplayObjectContainer;
  bottomStartPoint: Vector;
  bottomEndZone: TriggerZone;
  bottomXBounds: [number, number];

  gameDuration: number;
}

/**
 * Exposes static methods that create levels to be used in the main game
 */
export class LevelFactory {

  /** Call the getter to generate a "GUID" for objects */
  private static _Counter: number = 0;
  private static get Counter(): number {
    return LevelFactory._Counter++;
  }

  /** The following methods create commonly used components */
  /** The ground shall be tiled in the x direction to span the given width */
  private static MakeGround(width: number, height: number): TiledSpriteContainer {
    return new TiledSpriteContainer('ground' + LevelFactory.Counter, 'CakeWalk/tableCombined.png', width, height,
      (id: string, filename: string) => {
        return new Platform(id, filename);
      },
      2.0
    );
  }

  // these are for invisible walls at the bounds of the stage
  private static MakeWall(): Platform {
    var w = new Platform('wall' + LevelFactory.Counter, '');
    w.width = 50;
    w.height = 2000;
    w.visible = false;
    return w;
  }

  private static MakeCandle(c: MainGameColor = MainGameColor.Neutral): Platform {
    return new Platform('candle' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'CakeWalk/YellowCandle.png'
        : (c == MainGameColor.Red ? 'CakeWalk/RedCandle.png' : 'CakeWalk/BlueCandle.png'), c);
  }
  private static MakeCandleHoriz(c: MainGameColor = MainGameColor.Neutral): Platform {
    return new Platform('candle' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'CakeWalk/YellowCandleRotated.png'
        : (c == MainGameColor.Red ? 'CakeWalk/RedCandleRotated.png' : 'CakeWalk/BlueCandleRotated.png'), c);
  }

  private static MakeGate(c: MainGameColor = MainGameColor.Neutral): Gate {
    return new Gate('gate' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'CakeWalk/YellowCandle.png'
        : (c == MainGameColor.Red ? 'CakeWalk/RedCandle.png' : 'CakeWalk/BlueCandle.png'), c);
  }
  private static MakeGateHoriz(c: MainGameColor = MainGameColor.Neutral): Gate {
    return new Gate('gate' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'CakeWalk/YellowCandleRotated.png'
        : (c == MainGameColor.Red ? 'CakeWalk/RedCandleRotated.png' : 'CakeWalk/BlueCandleRotated.png'), c);
  }
  private static MakeTimedGate(c: MainGameColor = MainGameColor.Neutral, halfCycleTime: number): TimedGate {
    return new TimedGate('gate' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'CakeWalk/YellowCandle.png'
        : (c == MainGameColor.Red ? 'CakeWalk/RedCandle.png' : 'CakeWalk/BlueCandle.png'), halfCycleTime, c);
  }
  private static MakeTimedGateHoriz(c: MainGameColor = MainGameColor.Neutral, halfCycleTime: number): TimedGate {
    return new TimedGate('gate' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'CakeWalk/YellowCandleRotated.png'
        : (c == MainGameColor.Red ? 'CakeWalk/RedCandleRotated.png' : 'CakeWalk/BlueCandleRotated.png'), halfCycleTime, c);
  }

  private static MakeFlame(c: MainGameColor = MainGameColor.Neutral): Flame {
    return new Flame('flame' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'CakeWalk/animations/YellowFlameSprite.png'
        : (c == MainGameColor.Red ? 'CakeWalk/animations/RedFlameSprite.png' : 'CakeWalk/animations/BlueFlameSprite.png'), c, 3);
  }

  // TODO no neutral switch sprite
  private static MakeSwitch(c: MainGameColor = MainGameColor.Neutral): Switch {
    return new Switch('switch' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'CakeWalk/RedButton.png'
        : (c == MainGameColor.Red ? 'CakeWalk/RedButton.png' : 'CakeWalk/BlueButton.png'), c);
  }

  private static MakeEndZone(): TriggerZone {
    var z = new TriggerZone('end' + LevelFactory.Counter)
    z.addChild(new Sprite(z.id + '_post', 'CakeWalk/goalpost.png'));
    z.getChild(0).pivotPoint = new Vector(1.0, 0.0);  // zone only appears after right edge of goal stripe
    return z;
  }

  private static MakeCheckpoint(): Checkpoint {
    var c = new Checkpoint('checkpoint' + LevelFactory.Counter);
    c.dimensions = new Vector(100, 720 / 2);
    var s1: Sprite, s2: Sprite;
    c.addChild(s1 = new Sprite(c.id + '_post0', 'CakeWalk/checkpoint1.png'));
    c.addChild(s2 = new Sprite(c.id + '_post1', 'CakeWalk/checkpoint2.png'));
    s1.position = new Vector(0, 60);
    s2.position = new Vector(0, 60);
    s2.visible = false;
    return c;
  }

  /**
   * Given which level the player is on (indexed starting from 0),
   *  creates the display tree for those levels.
   * Ideally, levels starting from a certain number will be procedurally generated.
   */
  static GetLevel(num: number) {
    if (num == -1) {
      return LevelFactory.GetLevelTest();
    } else if (num == 0) {
      return LevelFactory.GetLevelOne();
    } else if (num == 1) {
      return LevelFactory.GetLevelTwo();
    } else if (num == 2) {
      return LevelFactory.GetLevelThree();
    } else if (num == 3) {
      return LevelFactory.GetLevelFour();
    } else {
      return LevelFactory.GetLevelFive();
    }
  }

  // first level - tutorial
  private static GetLevelOne(): LevelParams {
    // p1 and p2 are ground for each stage
    var p1: TiledSpriteContainer, p2: TiledSpriteContainer;

    // b1start b1end etc are invisible walls at the begining and end of level
    var b1start: Platform, b2start: Platform, b1end: Platform, b2end: Platform;
    // naming convention: object, world, order
    // object: c = candle, f = flame, g = gate, s = switch, q = checkpoint
    // world: 1 = world 1, 2 = world 2
    // order: from leftmost to right most type of that object a,b,c, etc.  after z it will go aa, ab, ac
    var c1a: Platform, c1b: Platform, c1c: Platform, c1d: Platform, c1e: Platform, c1f: Platform, c1g: Platform;
    var c2a: Platform, c2b: Platform, c2c: Platform, c2d: Platform, c2e: Platform, c2f: Platform, c2g: Platform;
    var f1a: Flame, f1b: Flame, f1c: Flame, f1d: Flame, f1e: Flame, f1f: Flame, f1g: Flame, f1h: Flame,
      f1i: Flame, f1j: Flame, f1k: Flame, f1l: Flame, f1m: Flame, f1n: Flame, f1o: Flame, f1p: Flame;
    var f2a: Flame, f2b: Flame, f2c: Flame, f2d: Flame, f2e: Flame, f2f: Flame, f2g: Flame, f2h: Flame,
      f2i: Flame, f2j: Flame, f2k: Flame, f2l: Flame, f2m: Flame, f2n: Flame, f2o: Flame, f2p: Flame;
    var g1a: Gate, g1b: Gate, g1c: Gate, g1d: Gate, g1e: Gate, g1f: Gate;
    var s1a: Switch, s1b: Switch, s1c: Switch, s1d: Switch, s1e: Switch, s1f: Switch;
    var g2a: Gate, g2b: Gate, g2c: Gate, g2d: Gate, g2e: Gate, g2f: Gate;;
    var s2a: Switch, s2b: Switch, s2c: Switch, s2d: Switch, s2e: Switch, s2f: Switch;
    var q1a: Checkpoint, q1b: Checkpoint;
    var q2a: Checkpoint, q2b: Checkpoint;
    // trigger zones for end of level
    var end1: TriggerZone, end2: TriggerZone;

    var abutton1: Sprite, abutton2: Sprite, xbutton1: Sprite, xbutton2: Sprite;

    var env1 = new DisplayObjectContainer('level0_top', '')
      .addChild(b1start = LevelFactory.MakeWall())
      .addChild(b1end = LevelFactory.MakeWall())
      .addChild(c1a = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c1b = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c1c = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c1d = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c1e = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c1f = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(s1a = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(g1a = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g1b = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(q1a = LevelFactory.MakeCheckpoint())
      .addChild(q1b = LevelFactory.MakeCheckpoint())
      .addChild(p1 = LevelFactory.MakeGround(4000, 80))
      .addChild(f1a = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1b = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1c = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1d = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1e = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1f = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1g = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1h = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1i = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1j = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1k = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1l = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1m = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1n = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1o = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1p = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(end1 = LevelFactory.MakeEndZone())
      .addChild(abutton1 = new Sprite('a_button_icon', 'CakeWalk/AButtonIcon.png'))
      .addChild(xbutton1 = new Sprite('x_button_icon', 'CakeWalk/XButtonIcon.png'));

    var env2 = new DisplayObjectContainer('level0_bottom', '')
      .addChild(b2start = LevelFactory.MakeWall())
      .addChild(b2end = LevelFactory.MakeWall())
      .addChild(c2a = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2b = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c2c = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c2d = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c2e = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c2f = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c2g = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(g2a = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(s2a = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s2b = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(q2a = LevelFactory.MakeCheckpoint())
      .addChild(q2b = LevelFactory.MakeCheckpoint())
      .addChild(p2 = LevelFactory.MakeGround(4000, 80))
      .addChild(f2a = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2b = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2c = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2d = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2e = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2f = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2g = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2h = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2i = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2j = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2k = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2l = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2m = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2n = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2o = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2p = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(end2 = LevelFactory.MakeEndZone())
      .addChild(abutton2 = new Sprite('a_button_icon', 'CakeWalk/AButtonIcon.png'))
      .addChild(xbutton2 = new Sprite('x_button_icon', 'CakeWalk/XButtonIcon.png'));

    // ground
    p1.position = new Vector(-200, 280);
    p2.position = new Vector(-200, 280);
    // invisible walls
    b1start.position = new Vector(-50, -500);
    b1end.position = new Vector(3000, -500);
    b2start.position = new Vector(-50, -500);
    b2end.position = new Vector(3000, -500);
    //first obstacle
    c1a.position = new Vector(250, 220);
    c2a.position = new Vector(250, 220);
    //second obstacle
    f1a.position = new Vector(600, 220);
    f2a.position = new Vector(600, 220);
    //third obstacle
    c1b.position = new Vector(900, 160);
    c2b.position = new Vector(900, 160);
    //fourth obstacle
    c1c.position = new Vector(1100, 160);
    c2c.position = new Vector(1100, 160);
    // checkpoint 1
    q1a.position = new Vector(1200, 0);
    q1a.spawnPoint = new Vector(1200, 200);
    q2a.position = new Vector(1200, 0);
    q2a.spawnPoint = new Vector(1200, 200);
    //fifth obstacle
    f1b.position = new Vector(1300, 220);
    f1c.position = new Vector(1350, 220);
    f1d.position = new Vector(1400, 220);
    f1e.position = new Vector(1450, 220);
    f1f.position = new Vector(1500, 220);
    f1g.position = new Vector(1550, 220);
    f2b.position = new Vector(1300, 220);
    f2c.position = new Vector(1350, 220);
    f2d.position = new Vector(1400, 220);
    f2e.position = new Vector(1450, 220);
    f2f.position = new Vector(1500, 220);
    f2g.position = new Vector(1550, 220);
    //sixth obstacle
    f1h.position = new Vector(1700, 220);
    f1i.position = new Vector(1750, 220);
    f1j.position = new Vector(1800, 220);
    f1k.position = new Vector(1850, 220);
    f1l.position = new Vector(1900, 220);
    f1m.position = new Vector(1950, 220);
    f2h.position = new Vector(1700, 220);
    f2i.position = new Vector(1750, 220);
    f2j.position = new Vector(1800, 220);
    f2k.position = new Vector(1850, 220);
    f2l.position = new Vector(1900, 220);
    f2m.position = new Vector(1950, 220);
    //seventh obstacle
    g1a.restPosition = g1a.position = new Vector(2200, 160);
    g1a.targetPosition = g1a.position.add(new Vector(0, -150));
    s2a.position = new Vector(2200, 205);
    g1a.syncSwitch(s2a);
    c2g.position = new Vector(2205, 220);
    // 2nd checkpoint
    q1b.position = new Vector(2300, 0);
    q1b.spawnPoint = new Vector(2300, 220);
    q2b.position = new Vector(2300, 0);
    q2b.spawnPoint = new Vector(2300, 220);
    //eighth obstacle
    c1d.position = new Vector(2400, 230);
    c1e.position = new Vector(2450, 180);
    c1f.position = new Vector(2500, 130);
    c2d.position = new Vector(2400, 230);
    c2e.position = new Vector(2450, 180);
    c2f.position = new Vector(2500, 150);
    f1n.position = new Vector(2400, 240);
    f1o.position = new Vector(2450, 190);
    f1p.position = new Vector(2500, 140);
    f2n.position = new Vector(2400, 240);
    f2o.position = new Vector(2450, 190);
    f2p.position = new Vector(2500, 140);
    g1b.restPosition = g1b.position = new Vector(2550, 25);
    g1b.targetPosition = g1b.position.add(new Vector(0, -150));
    s2b.position = new Vector(2500 + 16 - 20, 130);
    g1b.syncSwitch(s2b);
    g2a.restPosition = g2a.position = new Vector(2550, 25);
    g2a.targetPosition = g2a.position.add(new Vector(0, 150));
    s1a.position = new Vector(2700, 280 - 36);
    g2a.syncSwitch(s1a);
    // ending trigger zones
    end1.position = new Vector(2850, 0);
    end1.dimensions = new Vector(200, 300);
    end2.position = new Vector(2850, 0);
    end2.dimensions = new Vector(200, 300);
    // button icons
    abutton1.position = new Vector(250 + 16, 75);
    abutton2.position = new Vector(250 + 16, 75);
    xbutton1.position = new Vector(1000 + 16, 75);
    xbutton2.position = new Vector(1000 + 16, 75);
    [abutton1, abutton2, xbutton1, xbutton2].map((b: Sprite) => {
      b.pivotPoint = new Vector(0.5, 0.5);
    });

    return {
      topLevel: env1,
      topStartPoint: new Vector(50, 200),
      topEndZone: end1,
      topXBounds: [0, 3000],

      bottomLevel: env2,
      bottomStartPoint: new Vector(50, 200),
      bottomEndZone: end2,
      bottomXBounds: [0, 3000],

      gameDuration: 200,
    };
  }

  //level 2
  private static GetLevelTwo(): LevelParams {
    // p1 and p2 are ground for each stage
    var p1: TiledSpriteContainer, p2: TiledSpriteContainer;
    // b1start b1end etc are invisible walls at the begining and end of level
    var b1start: Platform, b2start: Platform, b1end: Platform, b2end: Platform;
    // naming convention: object, world, order
    // object: c = candle, f = flame, g = gate, s = switch, q = checkpoint
    // world: 1 = world 1, 2 = world 2
    // order: from leftmost to right most type of that object a,b,c, etc.  after z it will go aa, ab, ac
    var c1a: Platform, c1b: Platform, c1c: Platform, c1d: Platform, c1e: Platform, c1f: Platform, c1g: Platform, c1h: Platform;
    var c2a: Platform, c2b: Platform, c2c: Platform, c2d: Platform, c2e: Platform, c2f: Platform, c2g: Platform, c2h: Platform;
    var f1a: Flame, f1b: Flame, f1c: Flame, f1d: Flame, f1e: Flame, f1f: Flame, f1g: Flame, f1h: Flame,
      f1i: Flame, f1j: Flame, f1k: Flame, f1l: Flame, f1m: Flame, f1n: Flame, f1o: Flame, f1p: Flame, f1q: Flame,
      f1r: Flame, f1s: Flame, f1t: Flame, f1u: Flame,
      f1bb: Flame, f1cc: Flame, f1dd: Flame, f1ee: Flame, f1ff: Flame, f1gg: Flame, f1hh: Flame,
      f1ii: Flame, f1jj: Flame, f1kk: Flame, f1ll: Flame, f1mm: Flame, f1nn: Flame, f1oo: Flame, f1pp: Flame,
      f1qq: Flame, f1rr: Flame, f1ss: Flame, f1tt: Flame, f1uu: Flame;

    var f2a: Flame, f2b: Flame, f2c: Flame, f2d: Flame, f2e: Flame, f2f: Flame, f2g: Flame, f2h: Flame,
      f2i: Flame, f2j: Flame, f2k: Flame, f2l: Flame, f2m: Flame, f2n: Flame, f2o: Flame, f2p: Flame, f2q: Flame,
      f2r: Flame, f2s: Flame, f2t: Flame, f2u: Flame,
      f2bb: Flame, f2cc: Flame, f2dd: Flame, f2ee: Flame, f2ff: Flame, f2gg: Flame, f2hh: Flame,
      f2ii: Flame, f2jj: Flame, f2kk: Flame, f2ll: Flame, f2mm: Flame, f2nn: Flame, f2oo: Flame, f2pp: Flame,
      f2qq: Flame, f2rr: Flame, f2ss: Flame, f2tt: Flame, f2uu: Flame;

    var q1a: Checkpoint;
    var q2a: Checkpoint;
    var end1: TriggerZone, end2: TriggerZone;

    var env1 = new DisplayObjectContainer('level1_top', '')
      .addChild(b1start = LevelFactory.MakeWall())
      .addChild(b1end = LevelFactory.MakeWall())
      .addChild(c1a = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c1b = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c1c = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
      .addChild(c1d = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
      .addChild(c1e = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
      .addChild(c1f = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
      .addChild(c1g = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
      .addChild(c1h = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(q1a = LevelFactory.MakeCheckpoint())
      .addChild(p1 = LevelFactory.MakeGround(4000, 80))
      .addChild(f1a = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1b = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1c = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1d = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1e = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1f = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1g = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1h = LevelFactory.MakeFlame(MainGameColor.Neutral))
      //.addChild(f1i = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1j = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1k = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1l = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1m = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1n = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1o = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1p = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1q = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1r = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1s = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1t = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1u = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1bb = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1cc = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1dd = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1ee = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1ff = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1gg = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1hh = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1ii = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1jj = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1kk = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1ll = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1mm = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1nn = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1oo = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1pp = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1qq = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1rr = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1ss = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1tt = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1uu = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(end1 = LevelFactory.MakeEndZone());

    var env2 = new DisplayObjectContainer('level1_bottom', '')
      .addChild(b2start = LevelFactory.MakeWall())
      .addChild(b2end = LevelFactory.MakeWall())
      .addChild(c2a = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2b = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c2c = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
      .addChild(c2d = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
      .addChild(c2e = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
      .addChild(c2f = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
      .addChild(c2g = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
      .addChild(c2h = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(q2a = LevelFactory.MakeCheckpoint())
      .addChild(p2 = LevelFactory.MakeGround(4000, 80))
      .addChild(f2a = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2b = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2c = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2d = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2e = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2f = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2g = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2h = LevelFactory.MakeFlame(MainGameColor.Neutral))
      //.addChild(f2i = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2j = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2k = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2l = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2m = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2n = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2o = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2p = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2q = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2r = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2s = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2t = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2u = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2bb = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2cc = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2dd = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2ee = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2ff = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2gg = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2hh = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2ii = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2jj = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2kk = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2ll = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2mm = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2nn = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2oo = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2pp = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2qq = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2rr = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2ss = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2tt = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2uu = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(end2 = LevelFactory.MakeEndZone());

    // ground
    p1.position = new Vector(-200, 280);
    p2.position = new Vector(-200, 280);
    // invisible walls
    b1start.position = new Vector(-50, -500);
    b1end.position = new Vector(3000, -500);
    b2start.position = new Vector(-50, -500);
    b2end.position = new Vector(3000, -500);
    //first obstacle
    f1a.position = new Vector(50, 220);
    f2a.position = new Vector(50, 220);

    //second obstacle
    c1a.position = new Vector(300, 190);
    c2a.position = new Vector(300, 190);
    c1h.position = new Vector(300 - 45, 190 + 32);
    c2h.position = new Vector(300 - 45, 190 + 32);
    c1b.position = new Vector(600, 80);
    c2b.position = new Vector(600, 80);
    c1c.position = new Vector(750, 190);
    c2c.position = new Vector(750, 190);
    c1d.position = new Vector(775, 190);
    c2d.position = new Vector(775, 190);
    q1a.position = new Vector(900, 0);
    q1a.spawnPoint = new Vector(800, 200);
    q2a.position = new Vector(900, 0);
    q2a.spawnPoint = new Vector(800, 200);

    //third obstacle
    c1e.position = new Vector(1200, 160);
    c2e.position = new Vector(1200, 160);
    c1f.position = new Vector(1600, 120);
    c2f.position = new Vector(1600, 120);
    c1g.position = new Vector(2050, 80);
    c2g.position = new Vector(2050, 80);

    //fire floor
    f1b.position = new Vector(450, 220);
    f1c.position = new Vector(500, 220);
    f1d.position = new Vector(550, 220);
    f1e.position = new Vector(600, 220);
    f1f.position = new Vector(650, 220);
    f1g.position = new Vector(700, 220);
    f1h.position = new Vector(750, 220);
    //f1i.position = new Vector(800, 220);
    f1j.position = new Vector(850, 220);
    f1k.position = new Vector(900, 220);
    f1l.position = new Vector(950, 220);
    f1m.position = new Vector(1000, 220);
    f1n.position = new Vector(1050, 220);
    f1o.position = new Vector(1100, 220);
    f1p.position = new Vector(1150, 220);
    f1q.position = new Vector(1200, 220);
    f1r.position = new Vector(1250, 220);
    f1s.position = new Vector(1300, 220);
    f1t.position = new Vector(1350, 220);
    f1u.position = new Vector(1400, 220);
    f1bb.position = new Vector(1450, 220);
    f1cc.position = new Vector(1500, 220);
    f1dd.position = new Vector(1550, 220);
    f1ee.position = new Vector(1600, 220);
    f1ff.position = new Vector(1650, 220);
    f1gg.position = new Vector(1700, 220);
    f1hh.position = new Vector(1750, 220);
    f1ii.position = new Vector(1800, 220);
    f1jj.position = new Vector(1850, 220);
    f1kk.position = new Vector(1900, 220);
    f1ll.position = new Vector(1950, 220);
    f1mm.position = new Vector(2000, 220);
    f1nn.position = new Vector(2050, 220);
    f1oo.position = new Vector(2100, 220);
    f1pp.position = new Vector(2150, 220);
    f1qq.position = new Vector(2200, 220);
    f1rr.position = new Vector(2250, 220);
    f1ss.position = new Vector(2300, 220);
    f1tt.position = new Vector(2350, 220);
    f1uu.position = new Vector(2400, 220);
    f2b.position = new Vector(450, 220);
    f2c.position = new Vector(500, 220);
    f2d.position = new Vector(550, 220);
    f2e.position = new Vector(600, 220);
    f2f.position = new Vector(650, 220);
    f2g.position = new Vector(700, 220);
    f2h.position = new Vector(750, 220);
    //f2i.position = new Vector(800, 220);
    f2j.position = new Vector(850, 220);
    f2k.position = new Vector(900, 220);
    f2l.position = new Vector(950, 220);
    f2m.position = new Vector(1000, 220);
    f2n.position = new Vector(1050, 220);
    f2o.position = new Vector(1100, 220);
    f2p.position = new Vector(1150, 220);
    f2q.position = new Vector(1200, 220);
    f2r.position = new Vector(1250, 220);
    f2s.position = new Vector(1300, 220);
    f2t.position = new Vector(1350, 220);
    f2u.position = new Vector(1400, 220);
    f2bb.position = new Vector(1450, 220);
    f2cc.position = new Vector(1500, 220);
    f2dd.position = new Vector(1550, 220);
    f2ee.position = new Vector(1600, 220);
    f2ff.position = new Vector(1650, 220);
    f2gg.position = new Vector(1700, 220);
    f2hh.position = new Vector(1750, 220);
    f2ii.position = new Vector(1800, 220);
    f2jj.position = new Vector(1850, 220);
    f2kk.position = new Vector(1900, 220);
    f2ll.position = new Vector(1950, 220);
    f2mm.position = new Vector(2000, 220);
    f2nn.position = new Vector(2050, 220);
    f2oo.position = new Vector(2100, 220);
    f2pp.position = new Vector(2150, 220);
    f2qq.position = new Vector(2200, 220);
    f2rr.position = new Vector(2250, 220);
    f2ss.position = new Vector(2300, 220);
    f2tt.position = new Vector(2350, 220);
    f2uu.position = new Vector(2400, 220);
    // ending trigger zones
    end1.position = new Vector(2850, 0);
    end1.dimensions = new Vector(200, 300);
    end2.position = new Vector(2850, 0);
    end2.dimensions = new Vector(200, 300);

    return {
      topLevel: env1,
      topStartPoint: new Vector(50, 50),
      topEndZone: end1,
      topXBounds: [0, 3000],

      bottomLevel: env2,
      bottomStartPoint: new Vector(50, 50),
      bottomEndZone: end2,
      bottomXBounds: [0, 3000],

      gameDuration: 170,
    };
  }

  private static GetLevelThree(): LevelParams {
    // p1 and p2 are ground for each stage
    var p1: TiledSpriteContainer, p2: TiledSpriteContainer;
    // b1start b1end etc are invisible walls at the begining and end of level
    var b1start: Platform, b2start: Platform, b1end: Platform, b2end: Platform;
    // naming convention: object, world, order
    // object: c = candle, f = flame, g = gate, s = switch, q = checkpoint
    // world: 1 = world 1, 2 = world 2
    // order: from leftmost to right most type of that object a,b,c, etc.  after z it will go aa, ab, ac
    var c1a: Platform, c1b: Platform, c1c: Platform, c1d: Platform,
      c1e: Platform, c1f: Platform, c1g: Platform, c1h: Platform,
      c1i: Platform, c1j: Platform, c1k: Platform, c1l: Platform, c1m: Platform, c1n: Platform;
    var c2a: Platform, c2b: Platform, c2c: Platform, c2d: Platform,
      c2e: Platform, c2f: Platform, c2g: Platform, c2h: Platform,
      c2i: Platform, c2j: Platform, c2k: Platform, c2l: Platform, c2m: Platform, c2n: Platform;
    var f1a: Flame, f1b: Flame, f1c: Flame, f1d: Flame, f1e: Flame, f1f: Flame, f1g: Flame, f1h: Flame,
      f1i: Flame, f1j: Flame, f1k: Flame, f1l: Flame, f1m: Flame, f1n: Flame, f1o: Flame, f1p: Flame, f1q: Flame,
      f1r: Flame, f1s: Flame, f1t: Flame, f1u: Flame,
      f1bb: Flame, f1cc: Flame, f1dd: Flame, f1ee: Flame, f1ff: Flame, f1gg: Flame;
    var f2a: Flame, f2b: Flame, f2c: Flame, f2d: Flame, f2e: Flame, f2f: Flame, f2g: Flame, f2h: Flame,
      f2i: Flame, f2j: Flame, f2k: Flame, f2l: Flame, f2m: Flame, f2n: Flame, f2o: Flame, f2p: Flame, f2q: Flame,
      f2r: Flame, f2s: Flame, f2t: Flame, f2u: Flame,
      f2bb: Flame, f2cc: Flame, f2dd: Flame, f2ee: Flame, f2ff: Flame, f2gg: Flame;
    var g1a: Gate, g1b: Gate, g1c: Gate, g1d: Gate,
      g1e: Gate, g1f: Gate, g1g: Gate, g1h: Gate,
      g1i: Gate, g1j: Gate, g1k: Gate, g1l: Gate;
    var s1a: Switch, s1b: Switch, s1c: Switch, s1d: Switch,
      s1e: Switch, s1f: Switch, s1g: Switch, s1h: Switch;
    var g2a: Gate, g2b: Gate, g2c: Gate, g2d: Gate,
      g2e: Gate, g2f: Gate, g2g: Gate, g2h: Gate,
      g2i: Gate, g2j: Gate, g2k: Gate;
    var s2a: Switch, s2b: Switch, s2c: Switch, s2d: Switch,
      s2e: Switch, s2f: Switch, s2g: Switch, s2h: Switch;

    var q1a: Checkpoint, q1b: Checkpoint, q1c: Checkpoint;
    var q2a: Checkpoint, q2b: Checkpoint, q2c: Checkpoint;
    var end1: TriggerZone, end2: TriggerZone;

    var env1 = new DisplayObjectContainer('level2_top', '')
      .addChild(b1start = LevelFactory.MakeWall())
      .addChild(b1end = LevelFactory.MakeWall())
      .addChild(c1a = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c1c = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c1d = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
      .addChild(c1e = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c1f = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
      .addChild(c1g = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c1i = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c1j = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c1k = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c1l = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c1m = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c1n = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(q1a = LevelFactory.MakeCheckpoint())
      .addChild(q1b = LevelFactory.MakeCheckpoint())
      .addChild(q1c = LevelFactory.MakeCheckpoint())
      .addChild(s1a = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s1b = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s1c = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s1d = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s1e = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s1f = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s1g = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s1h = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(g1a = LevelFactory.MakeGate(MainGameColor.Red))
      .addChild(g1b = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g1c = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g1d = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g1e = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g1f = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g1g = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g1h = LevelFactory.MakeGate(MainGameColor.Blue))
      .addChild(g1i = LevelFactory.MakeGate(MainGameColor.Blue))
      .addChild(g1j = LevelFactory.MakeGateHoriz(MainGameColor.Blue))
      .addChild(g1k = LevelFactory.MakeGate(MainGameColor.Blue))
      .addChild(g1l = LevelFactory.MakeGate(MainGameColor.Blue))
      .addChild(c1h = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(p1 = LevelFactory.MakeGround(4000, 80))
      .addChild(f1b = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1c = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1d = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1e = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1f = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1g = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1h = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1i = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1j = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1k = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1l = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1m = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1n = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1o = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1p = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1q = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1r = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1s = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1t = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1u = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1bb = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1cc = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1dd = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1ee = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1ff = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1gg = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(end1 = LevelFactory.MakeEndZone());

    var env2 = new DisplayObjectContainer('level2_bottom', '')
      .addChild(b2start = LevelFactory.MakeWall())
      .addChild(b2end = LevelFactory.MakeWall())
      .addChild(c2a = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2c = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2d = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
      .addChild(c2e = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2f = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
      .addChild(c2g = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2i = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c2j = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c2k = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c2l = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2m = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c2n = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(q2a = LevelFactory.MakeCheckpoint())
      .addChild(q2b = LevelFactory.MakeCheckpoint())
      .addChild(q2c = LevelFactory.MakeCheckpoint())
      .addChild(s2a = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s2b = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s2c = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s2d = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s2e = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s2f = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s2g = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s2h = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(g2a = LevelFactory.MakeGate(MainGameColor.Blue))
      .addChild(g2b = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g2c = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g2d = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g2e = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g2f = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g2g = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g2h = LevelFactory.MakeGate(MainGameColor.Red))
      .addChild(g2i = LevelFactory.MakeGate(MainGameColor.Red))
      .addChild(g2j = LevelFactory.MakeGate(MainGameColor.Blue))
      .addChild(g2k = LevelFactory.MakeGate(MainGameColor.Blue))
      .addChild(c2h = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(p2 = LevelFactory.MakeGround(4000, 80))
      .addChild(f2b = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2c = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2d = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2e = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2f = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2g = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2h = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2i = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2j = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2k = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2l = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2m = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2n = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2o = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2p = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2q = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2r = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2s = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2t = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2u = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2bb = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2cc = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2dd = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2ee = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2ff = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2gg = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(end2 = LevelFactory.MakeEndZone());

    // ground
    p1.position = new Vector(-200, 280);
    p2.position = new Vector(-200, 280);
    // invisible walls
    b1start.position = new Vector(-50, -500);
    b1end.position = new Vector(3000, -500);
    b2start.position = new Vector(-50, -500);
    b2end.position = new Vector(3000, -500);
    //first obstacle
    c1a.position = new Vector(0, 130);
    c2a.position = new Vector(0, 130);
    g1a.restPosition = g1a.position = new Vector(300, 0);
    g1a.targetPosition = g1a.position.add(new Vector(950, 0));
    g2a.restPosition = g2a.position = new Vector(300, 0);
    g2a.targetPosition = g2a.position.add(new Vector(950, 0));
    g1g.restPosition = g1g.position = new Vector(600, 91);
    g1g.targetPosition = g1g.position.add(new Vector(0, 140));
    g1g.smoothFactor = 0.025;
    g2g.restPosition = g2g.position = new Vector(600, 91);
    g2g.targetPosition = g2g.position.add(new Vector(0, 140));
    g2g.smoothFactor = 0.025;

    s1a.position = new Vector(300, 185);
    s2a.position = new Vector(300, 185);
    g1a.syncSwitch(s1a);
    g2a.syncSwitch(s2a);
    g1g.syncSwitch(s1a);
    g2g.syncSwitch(s2a);

    //fire floor
    f1b.position = new Vector(0, 220);
    f1c.position = new Vector(50, 220);
    f1d.position = new Vector(100, 220);
    f1e.position = new Vector(150, 220);
    f1f.position = new Vector(200, 220);
    f1g.position = new Vector(250, 220);
    f1h.position = new Vector(300, 220);
    f1i.position = new Vector(350, 220);
    f1j.position = new Vector(400, 220);
    f1k.position = new Vector(450, 220);
    f1l.position = new Vector(500, 220);
    f1m.position = new Vector(550, 220);
    f1n.position = new Vector(600, 220);
    f1o.position = new Vector(650, 220);
    f1p.position = new Vector(700, 220);
    f1q.position = new Vector(750, 220);
    f1r.position = new Vector(750, 150);
    f1s.position = new Vector(750, 80);
    f1t.position = new Vector(750, 10);
    f1u.position = new Vector(750, -60);
    f2b.position = new Vector(0, 220);
    f2c.position = new Vector(50, 220);
    f2d.position = new Vector(100, 220);
    f2e.position = new Vector(150, 220);
    f2f.position = new Vector(200, 220);
    f2g.position = new Vector(250, 220);
    f2h.position = new Vector(300, 220);
    f2i.position = new Vector(350, 220);
    f2j.position = new Vector(400, 220);
    f2k.position = new Vector(450, 220);
    f2l.position = new Vector(500, 220);
    f2m.position = new Vector(550, 220);
    f2n.position = new Vector(600, 220);
    f2o.position = new Vector(650, 220);
    f2p.position = new Vector(700, 220);
    f2q.position = new Vector(750, 220);
    f2r.position = new Vector(750, 150);
    f2s.position = new Vector(750, 80);
    f2t.position = new Vector(750, 10);
    f2u.position = new Vector(750, -60);

    q1a.position = new Vector(680, 0);
    q1a.spawnPoint = new Vector(600, 15);
    q2a.position = new Vector(680, 0);
    q2a.spawnPoint = new Vector(600, 15);

    //second obstacle
    c1c.position = new Vector(875, 150);
    c2c.position = new Vector(875, 150);
    c1d.position = new Vector(775, 190);
    c2d.position = new Vector(775, 190);
    c1e.position = new Vector(875, 100);
    c2e.position = new Vector(875, 100);
    c1f.position = new Vector(775, 100);
    c2f.position = new Vector(775, 100);
    q1b.position = new Vector(1000, 0);
    q1b.spawnPoint = new Vector(1000, 200);
    q2b.position = new Vector(1000, 0);
    q2b.spawnPoint = new Vector(1000, 200);

    //third obstacle
    f1gg.position = new Vector(1050, -20);
    f2gg.position = new Vector(1050, -20);
    g1b.restPosition = g1b.position = new Vector(1100, 20);
    g1b.targetPosition = g1b.position.add(new Vector(0, 190));
    g2b.restPosition = g2b.position = new Vector(1100, 20);
    g2b.targetPosition = g2b.position.add(new Vector(0, 190));
    g1c.restPosition = g1c.position = new Vector(1250, 20);
    g1c.targetPosition = g1c.position.add(new Vector(0, 190));
    g2c.restPosition = g2c.position = new Vector(1250, 20);
    g2c.targetPosition = g2c.position.add(new Vector(0, 190));
    g1d.restPosition = g1d.position = new Vector(1400, 20);
    g1d.targetPosition = g1d.position.add(new Vector(200, 190));
    g2d.restPosition = g2d.position = new Vector(1400, 20);
    g2d.targetPosition = g2d.position.add(new Vector(200, 190));
    g1e.restPosition = g1e.position = new Vector(1550, 20);
    g1e.targetPosition = g1e.position.add(new Vector(-150, 190));
    g2e.restPosition = g2e.position = new Vector(1550, 20);
    g2e.targetPosition = g2e.position.add(new Vector(-150, 190));
    g1f.restPosition = g1f.position = new Vector(1898, 180);
    g1f.targetPosition = g1f.position.add(new Vector(-200, 0));
    g2f.restPosition = g2f.position = new Vector(1898, 180);
    g2f.targetPosition = g2f.position.add(new Vector(-200, 0));
    c1g.position = new Vector(1700, 20);
    c2g.position = new Vector(1700, 20);
    c1h.position = new Vector(1900, 180);
    c2h.position = new Vector(1900, 180);
    s1b.position = new Vector(1150, 190);
    s2b.position = new Vector(1150, 190);
    g1b.syncSwitch(s2b);
    g2b.syncSwitch(s1b);
    s1c.position = new Vector(1300, 190);
    s2c.position = new Vector(1300, 190);
    g1c.syncSwitch(s1c);
    g2c.syncSwitch(s2c);
    s1d.position = new Vector(1450, 190);
    s2d.position = new Vector(1450, 190);
    g1d.syncSwitch(s2e);
    g2d.syncSwitch(s1e);
    s1e.position = new Vector(1600, 190);
    s2e.position = new Vector(1600, 190);
    g1e.syncSwitch(s2d);
    g2e.syncSwitch(s1d);
    s1f.position = new Vector(1750, 190);
    s2f.position = new Vector(1750, 190);
    g1f.syncSwitch(s1f);
    g2f.syncSwitch(s2f);
    f1bb.position = new Vector(1150, 60);
    f1cc.position = new Vector(1300, 60);
    f1dd.position = new Vector(1450, 60);
    f1ee.position = new Vector(1600, 60);
    f1ff.position = new Vector(1750, 60);
    f2bb.position = new Vector(1150, 60);
    f2cc.position = new Vector(1300, 60);
    f2dd.position = new Vector(1450, 60);
    f2ee.position = new Vector(1600, 60);
    f2ff.position = new Vector(1750, 60);
    q1c.position = new Vector(2000, 0);
    q1c.spawnPoint = new Vector(2000, 200);
    q2c.position = new Vector(2000, 0);
    q2c.spawnPoint = new Vector(2000, 200);

    //fourth obstacle
    c1i.position = new Vector(2100, 240);
    g1h.position = g1h.restPosition = new Vector(2175, 195);
    g1h.targetPosition = g1h.position.add(new Vector(0, -60));
    c1j.position = new Vector(2255, 55);
    g1i.position = g1i.restPosition = new Vector(2335, 195);
    g1i.targetPosition = g1i.position.add(new Vector(0, -60));
    c1k.position = new Vector(2410, 240);
    s1g.position = new Vector(2255 - 4, 54);
    c1l.position = new Vector(2600, 170);
    c1m.position = new Vector(2600, 50);
    c1n.position = new Vector(2600, -70);
    g1j.position = g1j.restPosition = new Vector(2460, 165);
    g1j.targetPosition = g1j.position.add(new Vector(180, 0));
    g1k.position = g1k.restPosition = new Vector(2550, -70);
    g1k.targetPosition = g1k.position.add(new Vector(180, 0));
    g1l.position = g1l.restPosition = new Vector(2550, 50);
    g1l.targetPosition = g1l.position.add(new Vector(180, 0));
    s1h.position = new Vector(2670, 280 - 36);

    c2i.position = new Vector(2100, 240);
    g2h.position = g2h.restPosition = new Vector(2175, 135);
    g2h.targetPosition = g2h.position.add(new Vector(0, 60));
    c2j.position = new Vector(2255, 55);
    g2i.position = g2i.restPosition = new Vector(2335, 135);
    g2i.targetPosition = g2i.position.add(new Vector(0, 60));
    c2k.position = new Vector(2410, 240);
    s2g.position = new Vector(2255 - 4, 54);
    s2h.position = new Vector(2255 - 4, 280 - 36);
    c2l.position = new Vector(2600, 170);
    c2m.position = new Vector(2600, 50);
    c2n.position = new Vector(2600, -70);
    g2j.position = g2j.restPosition = new Vector(2650, -70);
    g2j.targetPosition = g2j.position.add(new Vector(0, -120));
    g2k.position = g2k.restPosition = new Vector(2650, 50);
    g2k.targetPosition = g2k.position.add(new Vector(0, -120));

    g1h.syncSwitch(s2h);
    g1i.syncSwitch(s2h);
    g2h.syncSwitch(s1g);
    g2i.syncSwitch(s1g);
    g1j.syncSwitch(s2g);
    g1k.syncSwitch(s2g);
    g1l.syncSwitch(s2g);
    g2j.syncSwitch(s1h);
    g2k.syncSwitch(s1h);

    // ending trigger zones
    end1.position = new Vector(2850, 0);
    end1.dimensions = new Vector(200, 300);
    end2.position = new Vector(2850, 0);
    end2.dimensions = new Vector(200, 300);

    return {
      topLevel: env1,
      topStartPoint: new Vector(50, 50),
      topEndZone: end1,
      topXBounds: [0, 3000],

      bottomLevel: env2,
      bottomStartPoint: new Vector(50, 50),
      bottomEndZone: end2,
      bottomXBounds: [0, 3000],

      gameDuration: 300,
    };
  }

  private static GetLevelFour(): LevelParams {

    var b1start: Platform, b2start: Platform, b1end: Platform, b2end: Platform;
    var p1: TiledSpriteContainer, p2: TiledSpriteContainer;
    var end1: TriggerZone, end2: TriggerZone;
    // naming convention: object, world, order
    // object: c = candle, f = flame, g = gate, s = switch, q = checkpoint
    // world: 1 = world 1, 2 = world 2
    // order: from leftmost to right most type of that object a,b,c, etc.  after z it will go aa, ab, ac
    var c1a: Platform, c1b: Platform, c1c: Platform;
    var c2a: Platform;
    var g1a: Gate, g1b: Gate, g1c: Gate, g1d: Gate,
      g1e: Gate, g1f: Gate, g1g: Gate, g1h: Gate,
      g1i: Gate, g1j: Gate, g1k: Gate, g1l: Gate,
      g1m: Gate, g1n: Gate, g1o: Gate;
    var s1a: Switch;
    var g2a: Gate, g2b: Gate, g2c: Gate, g2d: Gate,
      g2e: Gate, g2f: Gate, g2g: Gate, g2h: Gate,
      g2i: Gate, g2j: Gate, g2k: Gate, g2l: Gate,
      g2m: Gate;
    var s2a: Switch, s2b: Switch, s2c: Switch;
    var q1a: Checkpoint, q1b: Checkpoint;
    var q2a: Checkpoint, q2b: Checkpoint;
    var f1a: Flame, f1b: Flame, f1c: Flame, f1d: Flame,
      f1e: Flame, f1f: Flame, f1g: Flame, f1h: Flame,
      f1i: Flame, f1j: Flame, f1k: Flame, f1l: Flame,
      f1m: Flame, f1n: Flame, f1o: Flame, f1p: Flame,
      f1q: Flame, f1r: Flame, f1s: Flame, f1t: Flame,
      f1u: Flame, f1v: Flame, f1w: Flame, f1x: Flame,
      f1y: Flame, f1z: Flame, f1aa: Flame, f1ab: Flame,
      f1ac: Flame, f1ad: Flame, f1ae: Flame, f1af: Flame;
    var f2a: Flame, f2b: Flame, f2c: Flame, f2d: Flame,
      f2e: Flame, f2f: Flame, f2g: Flame, f2h: Flame,
      f2i: Flame, f2j: Flame, f2k: Flame, f2l: Flame,
      f2m: Flame, f2n: Flame, f2o: Flame, f2p: Flame,
      f2q: Flame, f2r: Flame, f2s: Flame, f2t: Flame,
      f2u: Flame, f2v: Flame, f2w: Flame, f2x: Flame,
      f2y: Flame, f2z: Flame, f2aa: Flame, f2ab: Flame,
      f2ac: Flame, f2ad: Flame, f2ae: Flame, f2af: Flame;

    var env1 = new DisplayObjectContainer('level3_top', '')
      .addChild(b1start = LevelFactory.MakeWall())
      .addChild(b1end = LevelFactory.MakeWall())
      .addChild(g1a = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g1b = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g1c = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(s1a = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(c1a = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c1b = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c1c = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(g1d = LevelFactory.MakeTimedGateHoriz(MainGameColor.Blue, 3.0))
      .addChild(g1e = LevelFactory.MakeTimedGateHoriz(MainGameColor.Red, 3.0))
      .addChild(g1f = LevelFactory.MakeTimedGateHoriz(MainGameColor.Blue, 3.0))
      .addChild(g1g = LevelFactory.MakeTimedGateHoriz(MainGameColor.Red, 3.0))
      .addChild(g1h = LevelFactory.MakeTimedGate(MainGameColor.Red, 2.5))
      .addChild(g1i = LevelFactory.MakeTimedGate(MainGameColor.Blue, 2.5))
      .addChild(g1j = LevelFactory.MakeTimedGate(MainGameColor.Blue, 2.0))
      .addChild(g1k = LevelFactory.MakeTimedGate(MainGameColor.Red, 2.0))
      .addChild(g1l = LevelFactory.MakeTimedGate(MainGameColor.Red, 1.5))
      .addChild(g1m = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 1.5))
      .addChild(g1n = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 1.0))
      .addChild(g1o = LevelFactory.MakeTimedGate(MainGameColor.Blue, 1.0))
      .addChild(q1a = LevelFactory.MakeCheckpoint())
      .addChild(q1b = LevelFactory.MakeCheckpoint())
      .addChild(p1 = LevelFactory.MakeGround(4000, 80))
      .addChild(f1a = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1b = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1c = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1d = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1e = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1f = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1g = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1h = LevelFactory.MakeFlame(MainGameColor.Red))

      .addChild(f1i = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1j = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1k = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1l = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1m = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1n = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1o = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1p = LevelFactory.MakeFlame(MainGameColor.Blue))

      .addChild(f1q = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1r = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1s = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1t = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1u = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1v = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1w = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1x = LevelFactory.MakeFlame(MainGameColor.Red))

      .addChild(f1y = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1z = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1aa = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f1ab = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1ac = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f1ad = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1ae = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f1af = LevelFactory.MakeFlame(MainGameColor.Neutral))

      .addChild(end1 = LevelFactory.MakeEndZone());

    var env2 = new DisplayObjectContainer('level3_bottom', '')
      .addChild(b2start = LevelFactory.MakeWall())
      .addChild(b2end = LevelFactory.MakeWall())
      .addChild(c2a = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(s2a = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s2b = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s2c = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(g2a = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g2b = LevelFactory.MakeTimedGateHoriz(MainGameColor.Red, 3.0))
      .addChild(g2c = LevelFactory.MakeTimedGateHoriz(MainGameColor.Blue, 3.0))
      .addChild(g2d = LevelFactory.MakeTimedGateHoriz(MainGameColor.Red, 3.0))
      .addChild(g2e = LevelFactory.MakeTimedGateHoriz(MainGameColor.Blue, 3.0))
      .addChild(g2f = LevelFactory.MakeTimedGate(MainGameColor.Red, 2.5))
      .addChild(g2g = LevelFactory.MakeTimedGate(MainGameColor.Blue, 2.5))
      .addChild(g2h = LevelFactory.MakeTimedGate(MainGameColor.Blue, 2.0))
      .addChild(g2i = LevelFactory.MakeTimedGate(MainGameColor.Red, 2.0))
      .addChild(g2j = LevelFactory.MakeTimedGate(MainGameColor.Red, 1.5))
      .addChild(g2k = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 1.5))
      .addChild(g2l = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 1.0))
      .addChild(g2m = LevelFactory.MakeTimedGate(MainGameColor.Blue, 1.0))
      .addChild(q2a = LevelFactory.MakeCheckpoint())
      .addChild(q2b = LevelFactory.MakeCheckpoint())
      .addChild(p2 = LevelFactory.MakeGround(4000, 80))
      .addChild(f2a = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2b = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2c = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2d = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2e = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2f = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2g = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2h = LevelFactory.MakeFlame(MainGameColor.Blue))

      .addChild(f2i = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2j = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2k = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2l = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2m = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2n = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2o = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2p = LevelFactory.MakeFlame(MainGameColor.Red))

      .addChild(f2q = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2r = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2s = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2t = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2u = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2v = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2w = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2x = LevelFactory.MakeFlame(MainGameColor.Blue))

      .addChild(f2y = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2z = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2aa = LevelFactory.MakeFlame(MainGameColor.Blue))
      .addChild(f2ab = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2ac = LevelFactory.MakeFlame(MainGameColor.Neutral))
      .addChild(f2ad = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2ae = LevelFactory.MakeFlame(MainGameColor.Red))
      .addChild(f2af = LevelFactory.MakeFlame(MainGameColor.Neutral))

      .addChild(end2 = LevelFactory.MakeEndZone());

    // ground
    p1.position = new Vector(-200, 280);
    p2.position = new Vector(-200, 280);
    // invisible walls
    b1start.position = new Vector(-50, -500);
    b1end.position = new Vector(3000, -500);
    b2start.position = new Vector(-50, -500);
    b2end.position = new Vector(3000, -500);
    // trigger zones
    end1.position = new Vector(2850, 0);
    end1.dimensions = new Vector(200, 300);
    end2.position = new Vector(2850, 0);
    end2.dimensions = new Vector(200, 300);
    // puzzle 1
    g1a.position = g1a.restPosition = new Vector(150, 152);
    g1a.targetPosition = g1a.position.add(new Vector(0, -90));
    g1b.position = g1b.restPosition = new Vector(250, 152);
    g1b.targetPosition = g1b.position.add(new Vector(0, -90));
    g1c.position = g1c.restPosition = new Vector(350, 152);
    g1c.targetPosition = g1c.position.add(new Vector(0, -90));
    s2a.position = new Vector(150, 244);
    g1a.syncSwitch(s2b);
    g1a.syncSwitch(s2c);
    s2b.position = new Vector(250, 244);
    g1b.syncSwitch(s2a);
    g1b.syncSwitch(s2c);
    s2c.position = new Vector(350, 244);
    g1c.syncSwitch(s2a);
    g1c.syncSwitch(s2b);
    g2a.position = g2a.restPosition = new Vector(675, 152);
    g2a.targetPosition = g2a.position.add(new Vector(0, -180));
    c2a.position = new Vector(675 + 32, 212);
    s1a.position = new Vector(50, 50);
    g2a.syncSwitch(s1a);
    c1a.position = new Vector(450, 200);
    c1b.position = new Vector(600, 152);
    c1c.position = new Vector(632, 200);
    // checkpoint
    q1a.position = new Vector(800, 0);
    q1a.spawnPoint = new Vector(800, 200);
    q2a.position = new Vector(800, 0);
    q2a.spawnPoint = new Vector(800, 200);
    // puzzle 2
    f1a.position = new Vector(900, 0);
    f1b.position = new Vector(950, 0);
    f1c.position = new Vector(1000, 0);
    f1d.position = new Vector(1050, 0);
    f1e.position = new Vector(900, 216);
    f1f.position = new Vector(950, 216);
    f1g.position = new Vector(1000, 216);
    f1h.position = new Vector(1050, 216);
    g1d.position = g1d.restPosition = new Vector(940, 200);
    g1d.targetPosition = g1d.position.add(new Vector(0, -136));
    f1i.position = new Vector(1100, 0);
    f1j.position = new Vector(1150, 0);
    f1k.position = new Vector(1200, 0);
    f1l.position = new Vector(1250, 0);
    f1m.position = new Vector(1100, 216);
    f1n.position = new Vector(1150, 216);
    f1o.position = new Vector(1200, 216);
    f1p.position = new Vector(1250, 216);
    g1e.position = g1e.restPosition = new Vector(1140, 200);
    g1e.targetPosition = g1e.position.add(new Vector(0, -136));
    f1q.position = new Vector(1300, 0);
    f1r.position = new Vector(1350, 0);
    f1s.position = new Vector(1400, 0);
    f1t.position = new Vector(1450, 0);
    f1u.position = new Vector(1300, 216);
    f1v.position = new Vector(1350, 216);
    f1w.position = new Vector(1400, 216);
    f1x.position = new Vector(1450, 216);
    g1f.position = g1f.restPosition = new Vector(1340, 200);
    g1f.targetPosition = g1f.position.add(new Vector(0, -136));
    f1y.position = new Vector(1500, 0);
    f1z.position = new Vector(1550, 0);
    f1aa.position = new Vector(1600, 0);
    f1ab.position = new Vector(1650, 0);
    f1ac.position = new Vector(1500, 216);
    f1ad.position = new Vector(1550, 216);
    f1ae.position = new Vector(1600, 216);
    f1af.position = new Vector(1650, 216);
    g1g.position = g1g.restPosition = new Vector(1540, 200);
    g1g.targetPosition = g1g.position.add(new Vector(0, -136));

    f2a.position = new Vector(900, 0);
    f2b.position = new Vector(950, 0);
    f2c.position = new Vector(1000, 0);
    f2d.position = new Vector(1050, 0);
    f2e.position = new Vector(900, 216);
    f2f.position = new Vector(950, 216);
    f2g.position = new Vector(1000, 216);
    f2h.position = new Vector(1050, 216);
    g2b.position = g2b.restPosition = new Vector(940, 200);
    g2b.targetPosition = g2b.position.add(new Vector(0, -136));
    f2i.position = new Vector(1100, 0);
    f2j.position = new Vector(1150, 0);
    f2k.position = new Vector(1200, 0);
    f2l.position = new Vector(1250, 0);
    f2m.position = new Vector(1100, 216);
    f2n.position = new Vector(1150, 216);
    f2o.position = new Vector(1200, 216);
    f2p.position = new Vector(1250, 216);
    g2c.position = g2c.restPosition = new Vector(1140, 200);
    g2c.targetPosition = g2c.position.add(new Vector(0, -136));
    f2q.position = new Vector(1300, 0);
    f2r.position = new Vector(1350, 0);
    f2s.position = new Vector(1400, 0);
    f2t.position = new Vector(1450, 0);
    f2u.position = new Vector(1300, 216);
    f2v.position = new Vector(1350, 216);
    f2w.position = new Vector(1400, 216);
    f2x.position = new Vector(1450, 216);
    g2d.position = g2d.restPosition = new Vector(1340, 200);
    g2d.targetPosition = g2d.position.add(new Vector(0, -136));
    f2y.position = new Vector(1500, 0);
    f2z.position = new Vector(1550, 0);
    f2aa.position = new Vector(1600, 0);
    f2ab.position = new Vector(1650, 0);
    f2ac.position = new Vector(1500, 216);
    f2ad.position = new Vector(1550, 216);
    f2ae.position = new Vector(1600, 216);
    f2af.position = new Vector(1650, 216);
    g2e.position = g2e.restPosition = new Vector(1540, 200);
    g2e.targetPosition = g2e.position.add(new Vector(0, -136));
    // checkpoint 2
    q1b.position = new Vector(1800, 0);
    q1b.spawnPoint = new Vector(1800, 200);
    q2b.position = new Vector(1800, 0);
    q2b.spawnPoint = new Vector(1800, 200);

    // puzzle 3
    g1h.position = g1h.restPosition = new Vector(2000, -50);
    g1h.targetPosition = g1h.position.add(new Vector(0, 50));
    g1i.position = g1i.restPosition = new Vector(2000, 200);
    g1i.targetPosition = g1i.position.add(new Vector(0, -50));
    g1j.position = g1j.restPosition = new Vector(2200, -50);
    g1j.targetPosition = g1j.position.add(new Vector(0, 50));
    g1k.position = g1k.restPosition = new Vector(2200, 200);
    g1k.targetPosition = g1k.position.add(new Vector(0, -50));
    g1l.position = g1l.restPosition = new Vector(2400, -50);
    g1l.targetPosition = g1l.position.add(new Vector(0, 50));
    g1m.position = g1m.restPosition = new Vector(2400, 200);
    g1m.targetPosition = g1m.position.add(new Vector(0, -50));
    g1n.position = g1n.restPosition = new Vector(2600, -50);
    g1n.targetPosition = g1n.position.add(new Vector(0, 50));
    g1o.position = g1o.restPosition = new Vector(2600, 200);
    g1o.targetPosition = g1o.position.add(new Vector(0, -50));

    g2f.position = g2f.restPosition = new Vector(2000, -50);
    g2f.targetPosition = g2f.position.add(new Vector(0, 50));
    g2g.position = g2g.restPosition = new Vector(2000, 200);
    g2g.targetPosition = g2g.position.add(new Vector(0, -50));
    g2h.position = g2h.restPosition = new Vector(2200, -50);
    g2h.targetPosition = g2h.position.add(new Vector(0, 50));
    g2i.position = g2i.restPosition = new Vector(2200, 200);
    g2i.targetPosition = g2i.position.add(new Vector(0, -50));
    g2j.position = g2j.restPosition = new Vector(2400, -50);
    g2j.targetPosition = g2j.position.add(new Vector(0, 50));
    g2k.position = g2k.restPosition = new Vector(2400, 200);
    g2k.targetPosition = g2k.position.add(new Vector(0, -50));
    g2l.position = g2l.restPosition = new Vector(2600, -50);
    g2l.targetPosition = g2l.position.add(new Vector(0, 50));
    g2m.position = g2m.restPosition = new Vector(2600, 200);
    g2m.targetPosition = g2m.position.add(new Vector(0, -50));

    return {
      topLevel: env1,
      topStartPoint: new Vector(50, 200),
      topEndZone: end1,
      topXBounds: [0, 3000],

      bottomLevel: env2,
      bottomStartPoint: new Vector(50, 200),
      bottomEndZone: end2,
      bottomXBounds: [0, 3000],

      gameDuration: 275,
    };
  }

  private static GetLevelFive(): LevelParams {

    var b1start: Platform, b2start: Platform, b1end: Platform, b2end: Platform;
    var p1: TiledSpriteContainer, p2: TiledSpriteContainer;
    var end1: TriggerZone, end2: TriggerZone;

    var c1a: Platform, c1b: Platform, c1c: Platform, c1d: Platform,
      c1e: Platform, c1f: Platform, c1g: Platform, c1h: Platform,
      c1i: Platform, c1j: Platform, c1k: Platform, c1l: Platform;
    var c2a: Platform, c2b: Platform, c2c: Platform, c2d: Platform,
      c2e: Platform, c2f: Platform, c2g: Platform, c2h: Platform,
      c2i: Platform, c2j: Platform, c2k: Platform, c2l: Platform,
      c2m: Platform, c2n: Platform, c2o: Platform, c2p: Platform,
      c2q: Platform, c2r: Platform, c2s: Platform, c2t: Platform,
      c2u: Platform, c2v: Platform, c2w: Platform, c2x: Platform,
      c2y: Platform, c2z: Platform, c2aa: Platform, c2bb: Platform,
      c2cc: Platform, c2dd: Platform, c2ee: Platform, c2ff: Platform,
      c2gg: Platform, c2hh: Platform, c2ii: Platform, c2jj: Platform;
    var g1a: Gate, g1b: Gate, g1c: Gate, g1d: Gate,
      g1e: Gate, g1f: Gate, g1g: Gate, g1h: Gate,
      g1i: Gate, g1j: Gate, g1k: Gate, g1l: Gate,
      g1m: Gate, g1n: Gate, g1o: Gate, g1p: Gate,
      g1q: Gate, g1r: Gate, g1s: Gate, g1t: Gate,
      g1u: Gate, g1v: Gate, g1w: Gate;
    var g2a: Gate, g2b: Gate, g2c: Gate, g2d: Gate,
      g2e: Gate, g2f: Gate, g2g: Gate, g2h: Gate,
      g2i: Gate, g2j: Gate, g2k: Gate, g2l: Gate,
      g2m: Gate, g2n: Gate, g2o: Gate, g2p: Gate,
      g2q: Gate, g2r: Gate, g2s: Gate, g2t: Gate,
      g2u: Gate, g2v: Gate, g2w: Gate;
    var s1a: Switch, s1b: Switch, s1c: Switch, s1d: Switch,
      s1e: Switch;
    var s2a: Switch, s2b: Switch, s2c: Switch, s2d: Switch,
      s2e: Switch, s2f: Switch, s2g: Switch, s2h: Switch,
      s2i: Switch, s2j: Switch, s2k: Switch, s2l: Switch;
    var q1a: Checkpoint, q1b: Checkpoint;
    var q2a: Checkpoint, q2b: Checkpoint, q2c: Checkpoint;

    var env1 = new DisplayObjectContainer('level4_top', '')
      .addChild(b1start = LevelFactory.MakeWall())
      .addChild(b1end = LevelFactory.MakeWall())
      .addChild(c1a = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c1b = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c1c = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
      .addChild(c1d = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
      .addChild(c1e = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c1f = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c1g = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c1h = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c1i = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c1j = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c1k = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c1l = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(g1a = LevelFactory.MakeGate(MainGameColor.Blue))
      .addChild(g1b = LevelFactory.MakeGate(MainGameColor.Blue))
      .addChild(g1c = LevelFactory.MakeGate(MainGameColor.Red))
      .addChild(g1d = LevelFactory.MakeGate(MainGameColor.Red))
      .addChild(g1e = LevelFactory.MakeGateHoriz(MainGameColor.Blue))
      .addChild(g1f = LevelFactory.MakeGateHoriz(MainGameColor.Red))
      .addChild(g1g = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g1h = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g1i = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 2.0))
      .addChild(g1j = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g1k = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g1l = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g1m = LevelFactory.MakeTimedGate(MainGameColor.Blue, 0.95))
      .addChild(g1n = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 0.95))
      .addChild(g1o = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 0.95))
      .addChild(g1p = LevelFactory.MakeTimedGate(MainGameColor.Red, 0.95))
      .addChild(g1q = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 0.95))
      .addChild(g1r = LevelFactory.MakeTimedGate(MainGameColor.Blue, 0.95))
      .addChild(g1s = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 0.95))
      .addChild(g1t = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 0.95))
      .addChild(g1u = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g1v = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g1w = LevelFactory.MakeTimedGateHoriz(MainGameColor.Neutral, 7.75))
      .addChild(q1a = LevelFactory.MakeCheckpoint())
      .addChild(q1b = LevelFactory.MakeCheckpoint())
      .addChild(p1 = LevelFactory.MakeGround(4000, 80))
      .addChild(s1a = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s1b = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s1c = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s1d = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s1e = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(end1 = LevelFactory.MakeEndZone());

    var env2 = new DisplayObjectContainer('level4_bottom', '')
      .addChild(b2start = LevelFactory.MakeWall())
      .addChild(b2end = LevelFactory.MakeWall())
      .addChild(c2a = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2b = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2c = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2d = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2e = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2f = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2g = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2h = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2i = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2j = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2k = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
      .addChild(c2l = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
      .addChild(c2m = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2n = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2o = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
      .addChild(c2p = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
      .addChild(c2q = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c2r = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c2s = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c2t = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2u = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c2v = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c2w = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2x = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2y = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c2z = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c2aa = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2bb = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2cc = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2dd = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2ee = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2ff = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2gg = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2hh = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2ii = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
      .addChild(c2jj = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(g2a = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g2b = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g2c = LevelFactory.MakeTimedGate(MainGameColor.Red, 2.0))
      .addChild(g2d = LevelFactory.MakeTimedGateHoriz(MainGameColor.Red, 2.0))
      .addChild(g2e = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g2f = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g2g = LevelFactory.MakeTimedGate(MainGameColor.Blue, 2.0))
      .addChild(g2h = LevelFactory.MakeTimedGate(MainGameColor.Blue, 1.75))
      .addChild(g2i = LevelFactory.MakeTimedGate(MainGameColor.Blue, 1.5))
      .addChild(g2j = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 2.0))
      .addChild(g2k = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g2l = LevelFactory.MakeGateHoriz(MainGameColor.Neutral))
      .addChild(g2m = LevelFactory.MakeTimedGate(MainGameColor.Red, 0.95))
      .addChild(g2n = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 0.95))
      .addChild(g2o = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 0.95))
      .addChild(g2p = LevelFactory.MakeTimedGate(MainGameColor.Blue, 0.95))
      .addChild(g2q = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 0.95))
      .addChild(g2r = LevelFactory.MakeTimedGate(MainGameColor.Red, 0.95))
      .addChild(g2s = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 0.95))
      .addChild(g2t = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 0.95))
      .addChild(g2u = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g2v = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(g2w = LevelFactory.MakeTimedGateHoriz(MainGameColor.Neutral, 7.75))
      .addChild(q2a = LevelFactory.MakeCheckpoint())
      .addChild(q2b = LevelFactory.MakeCheckpoint())
      .addChild(q2c = LevelFactory.MakeCheckpoint())
      .addChild(p2 = LevelFactory.MakeGround(4000, 80))
      .addChild(s2a = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s2b = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s2c = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s2d = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s2e = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s2f = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s2g = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s2h = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s2i = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s2j = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s2k = LevelFactory.MakeSwitch(MainGameColor.Red))
      .addChild(s2l = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(end2 = LevelFactory.MakeEndZone());

    // ground
    p1.position = new Vector(-200, 280);
    p2.position = new Vector(-200, 280);
    // invisible walls
    b1start.position = new Vector(-50, -500);
    b1end.position = new Vector(3000, -500);
    b2start.position = new Vector(-50, -500);
    b2end.position = new Vector(3000, -500);
    // trigger zones
    end1.position = new Vector(2850, 0);
    end1.dimensions = new Vector(200, 300);
    end2.position = new Vector(2850, 0);
    end2.dimensions = new Vector(200, 300);

    // puzzle 1
    g1a.position = g1a.restPosition = new Vector(225, 230);
    g1a.targetPosition = g1a.position.add(new Vector(0, -60));
    g1b.position = g1b.restPosition = new Vector(225 + 32 + 128, 230);
    g1b.targetPosition = g1b.position.add(new Vector(0, -60));
    g1e.position = g1e.restPosition = new Vector(225 + 32, 140);
    g1e.targetPosition = g1e.position.add(new Vector(0, 120));
    g1c.position = g1c.restPosition = new Vector(575, 230);
    g1c.targetPosition = g1c.position.add(new Vector(0, -60));
    g1d.position = g1d.restPosition = new Vector(575 + 32 + 128, 230);
    g1d.targetPosition = g1d.position.add(new Vector(0, -60));
    g1f.position = g1f.restPosition = new Vector(575 + 32, 140);
    g1f.targetPosition = g1f.position.add(new Vector(0, 120));
    g1g.position = g1g.restPosition = new Vector(925, 280 - 120);
    g1g.targetPosition = g1g.position.add(new Vector(0, 70));
    g1h.position = g1h.restPosition = new Vector(925, 280 - 120 - 150);
    g1h.targetPosition = g1h.position.add(new Vector(0, -70));
    s1a.position = new Vector(225 + 32 + 64 - 20, 280 - 36);
    s1b.position = new Vector(575 + 32 + 64 - 20, 280 - 36);
    g1a.syncSwitch(s1a);
    g1b.syncSwitch(s1a);
    g1c.syncSwitch(s1b);
    g1d.syncSwitch(s1b);
    c2a.position = new Vector(150, 280 - 128 - 60);
    c2b.position = new Vector(150 + 35, 280 - 128 - 60 - 140);
    c2c.position = new Vector(150 + 32 + 2 * 128, 280 - 128);
    c2d.position = new Vector(150 + 32 + 2 * 128, 280 - 128 - 70);
    g2a.position = g2a.restPosition = new Vector(150 + 32, 280 - 32);
    g2a.targetPosition = g2a.position.add(new Vector(0, -325));
    g2b.position = g2b.restPosition = new Vector(150 + 32 + 128, 280 - 32);
    g2b.targetPosition = g2b.position.add(new Vector(0, -325));
    g2a.syncSwitch(s1a);
    g2b.syncSwitch(s1a);
    g2c.position = g2c.restPosition = new Vector(360, 260);
    g2c.targetPosition = g2c.position.add(new Vector(0, -75));
    s2a.position = new Vector(360 - 40 - 8, 280 - 36);
    s2b.position = new Vector(360 + 32 + 8, 280 - 36);
    g2d.position = g2d.restPosition = new Vector(150 + 32, 80);
    g2d.targetPosition = g2d.position.add(new Vector(0, 65));
    s2c.position = new Vector(150 + 32 + 128 - 40, 80 + 65 - 36);
    s2d.position = new Vector(150 + 32 + 2 * 128 - 40, 65);
    [s2a, s2b, s2c, s2d].map((s: Switch) => {
      g1e.syncSwitch(s);
    });
    c2e.position = new Vector(150 + 32 + 2 * 128, 280 - 128 - 70);
    c2f.position = new Vector(150 + 3 * 128, 280 - 128 - 70);
    c2g.position = new Vector(150 + 3 * 128, 280 - 128);
    c2h.position = new Vector(150 + 5 * 128 + 32, 280 - 128 - 60);
    c2i.position = new Vector(150 + 5 * 128 + 32, 280 - 128 * 2 - 60);
    c2j.position = new Vector(150 + 5 * 128 + 32, 280 - 128 * 3 - 60);
    g2e.position = g2e.restPosition = new Vector(150 + 3 * 128 + 32, 24);
    g2e.targetPosition = g2e.position.add(new Vector(0, 280 - 24));
    g2f.position = g2f.restPosition = new Vector(150 + 4 * 128 + 32, 24);
    g2f.targetPosition = g2f.position.add(new Vector(0, 280 - 24));
    g2e.syncSwitch(s1b);
    g2f.syncSwitch(s1b);
    c2k.position = new Vector(150 + 3 * 128 + 32, -8);
    c2l.position = new Vector(150 + 4 * 128 + 32, -8);
    g2g.position = g2g.restPosition = new Vector(150 + 3 * 128 + 32, 150);
    g2g.targetPosition = g2g.position.add(new Vector(0, 80));
    g2h.position = g2h.restPosition = new Vector(150 + 3 * 128 + 32 + 172, -8 + 32 + 60);
    g2h.targetPosition = g2h.position.add(new Vector(0, 30));
    g2i.position = g2i.restPosition = new Vector(150 + 3 * 128 + 32 + 82, -30);
    g2i.targetPosition = g2i.position.add(new Vector(0, 250));
    s2e.position = new Vector(150 + 3 * 128 + 32 * 2 + 20, 280 - 36);
    s2f.position = new Vector(150 + 3 * 128 + 32 * 2 + 60 + 20, 280 - 36);
    s2g.position = new Vector(150 + 3 * 128 + 32 * 2 + 60 * 2 + 20, 280 - 36);
    [s2e, s2f, s2g].map((s: Switch) => {
      g1f.syncSwitch(s);
    });
    s2h.position = new Vector(925, 280 - 36);
    g1g.syncSwitch(s2h);
    g1h.syncSwitch(s2h);
    q1a.position = new Vector(1000, 0);
    q1a.spawnPoint = new Vector(1000, 200);
    q2a.position = new Vector(480, 0);
    q2a.spawnPoint = new Vector(480, 20);
    q2b.position = new Vector(1000, 0);
    q2b.spawnPoint = new Vector(1000, 200);

    // puzzle 2
    g1i.position = g1i.restPosition = new Vector(1100 + 64 - 16, 150);
    g1i.targetPosition = g1i.position.add(new Vector(0, 65));
    g2j.position = g2j.restPosition = new Vector(1100 + 64 - 16, 150);
    g2j.targetPosition = g2j.position.add(new Vector(0, 65));
    c1a.position = new Vector(1100 + 128, 110);
    c1b.position = new Vector(1100 + 128 * 2, 110);
    c1c.position = new Vector(1100 + 128 * 3, 110);
    c1d.position = new Vector(1100 + 128 * 4, 110);
    c1e.position = new Vector(1100 + 128 * 2 - 16, 110 - 128);
    c1f.position = new Vector(1100 + 128 * 2 - 16, 110 + 32);
    g1j.position = g1j.restPosition = new Vector(1100 + 128 * 3 - 16, 110 - 128);
    g1j.targetPosition = g1j.position.add(new Vector(0, -100));
    c1g.position = new Vector(1100 + 128 * 3 - 16, 110 + 32);
    c1h.position = new Vector(1100 + 128 * 4 - 16, 110 - 128);
    c1i.position = new Vector(1100 + 128 * 4 - 16, 110 + 32);
    c1j.position = new Vector(1100 + 128 * 5 - 16, 110 - 128);
    c1k.position = new Vector(1100 + 128 * 5 - 16, 110 + 32);
    g1k.position = g1k.restPosition = new Vector(1100 + 128 * 5, 110);
    g1k.targetPosition = g1k.position.add(new Vector(0, 280 - 110));
    g1l.position = g1l.restPosition = new Vector(1100 + 128 * 6 - 16, 110 + 32)
    g1l.targetPosition = g1l.position.add(new Vector(0, -100));
    c2m.position = new Vector(1100 + 128, 110);
    c2n.position = new Vector(1100 + 128 * 2, 110);
    c2o.position = new Vector(1100 + 128 * 3, 110);
    c2p.position = new Vector(1100 + 128 * 4, 110);
    c2q.position = new Vector(1100 + 128 * 2 - 16, 110 - 128);
    c2r.position = new Vector(1100 + 128 * 2 - 16, 110 + 32);
    c2s.position = new Vector(1100 + 128 * 3 - 16, 110 - 128);
    c2t.position = new Vector(1100 + 128 * 3 - 16, 110 + 32);
    g2k.position = g2k.restPosition = new Vector(1100 + 128 * 4 - 16, 110 - 128);
    g2k.targetPosition = g2k.position.add(new Vector(0, -100));
    c2u.position = new Vector(1100 + 128 * 4 - 16, 110 + 32);
    c2v.position = new Vector(1100 + 128 * 5 - 16, 110 - 128);
    c2w.position = new Vector(1100 + 128 * 5 - 16, 110 + 32);
    c2x.position = new Vector(1100 + 128 * 5 - 16 + 32, 110 + 32 + 64);
    g2l.position = g2l.restPosition = new Vector(1100 + 128 * 4, 110 - 128 - 32 - 20);
    g2l.targetPosition = g2l.position.add(new Vector(0, 280 - (110 - 128 - 32 - 20)));
    s1c.position = new Vector(1100 + 128 * 5 - 16 - 40, 110 - 36);
    s1d.position = new Vector(1100 + 128 * 6 - 64, 280 - 36);
    s2i.position = new Vector(1100 + 128 * 3 - 64, 280 - 36);
    s2j.position = new Vector(1100 + 128 * 5 - 64, 280 - 36);
    s2k.position = new Vector(1100 + 128 * 6 - 64, 280 - 36);
    g1j.syncSwitch(s2i);
    g1k.syncSwitch(s1d);
    g2k.syncSwitch(s1c);
    g2l.syncSwitch(s2j);
    g1l.syncSwitch(s2k);
    q1b.position = new Vector(1950, 0);
    q1b.spawnPoint = new Vector(1950, 200);
    q2c.position = new Vector(1880, 0);
    q2c.spawnPoint = new Vector(1880, 200);

    // puzzle 3
    c2y.position = new Vector(2050 - 32 - 44 - 32, 220);
    c2z.position = new Vector(2050 - 32, 165);
    c2aa.position = new Vector(2050, 0);
    c2bb.position = new Vector(2050 + 128, 0);
    c2cc.position = new Vector(2050 + 128 * 2, 0);
    c2dd.position = new Vector(2050 + 128 * 3, 0);
    c2ee.position = new Vector(2050, 110);
    c2ff.position = new Vector(2050 + 128, 110);
    c2gg.position = new Vector(2050 + 128 * 2, 110);
    c2hh.position = new Vector(2050 + 128 * 3, 110);
    c2ii.position = new Vector(2050 + 128 * 4, 0);
    c2jj.position = new Vector(2050 + 128 * 4 - 32, 110 + 32);
    c1l.position = new Vector(2050 + 128 * 4, 0);
    var lstGates1: Gate[] = [g1m, g1n, g1o, g1p, g1q, g1r, g1s, g1t];
    var lstGates2: Gate[] = [g2m, g2n, g2o, g2p, g2q, g2r, g2s, g2t];
    for (var i = 0; i < lstGates1.length; i++) {
      lstGates1[i].position = lstGates1[i].restPosition = new Vector(2050 + i * 64, 280 - 128);
      lstGates1[i].targetPosition = lstGates1[i].position.add(new Vector(0, -175));
      lstGates2[i].position = lstGates2[i].restPosition = new Vector(2050 + i * 64, 280 - 128 - 175);
      lstGates2[i].targetPosition = lstGates2[i].position.add(new Vector(0, 175));
      lstGates1[i].smoothFactor = lstGates2[i].smoothFactor = 0.1;
    }
    g1u.position = g1u.restPosition = new Vector(2050 + 128 * 4 + 64, 280 - 120);
    g1u.targetPosition = g1u.position.add(new Vector(0, 70));
    g1v.position = g1v.restPosition = new Vector(2050 + 128 * 4 + 64, 280 - 120 - 150);
    g1v.targetPosition = g1v.position.add(new Vector(0, -70));
    g2u.position = g2u.restPosition = new Vector(2050 + 128 * 4 + 64, 280 - 120);
    g2u.targetPosition = g2u.position.add(new Vector(0, 70));
    g2v.position = g2v.restPosition = new Vector(2050 + 128 * 4 + 64, 280 - 120 - 150);
    g2v.targetPosition = g2v.position.add(new Vector(0, -70));
    [g1u, g1v, g2u, g2v].map((g: Gate) => {
      g.smoothFactor = 0.1;
    });
    s1e.position = new Vector(2050 + 128 * 4 + 64 + 32 + 45, 280 - 36);
    s2l.position = new Vector(2050 + 128 * 4 + 5, 280 - 36);
    g1u.syncSwitch(s2l);
    g1v.syncSwitch(s2l);
    g2u.syncSwitch(s1e);
    g2v.syncSwitch(s1e);
    g1w.position = g1w.restPosition = new Vector(2050 + 128 * 4, 0);
    g1w.targetPosition = g1w.position.add(new Vector(0, 280));
    g1w.smoothFactor = 0.115;
    g2w.position = g2w.restPosition = new Vector(2050 + 128 * 4, 0);
    g2w.targetPosition = g2w.position.add(new Vector(0, 280));
    g2w.smoothFactor = 0.115;
    [s1d, s2a, s2b, s2c, s2d, s2e, s2f, s2g, s2j].map((s: Switch) => {
      s.addChild(new Sprite(s.id + '_x', 'CakeWalk/transparent_x.png'));
    });

    return {
      topLevel: env1,
      topStartPoint: new Vector(50, 200),
      topEndZone: end1,
      topXBounds: [0, 3000],

      bottomLevel: env2,
      bottomStartPoint: new Vector(50, 200),
      bottomEndZone: end2,
      bottomXBounds: [0, 3000],

      gameDuration: 325,
    };
  }


  private static GetLevelTest(): LevelParams {
    var tg1a: TimedGate, tg1b: TimedGate, tg2a: TimedGate, tg2b: TimedGate;
    var s2a: Switch;
    var p1: TiledSpriteContainer, p2: TiledSpriteContainer;
    var end1: TriggerZone, end2: TriggerZone;

    var env1 = new DisplayObjectContainer('testlevel_top', '')
      .addChild(tg1a = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 5))
      .addChild(tg1b = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 2))
      .addChild(p1 = LevelFactory.MakeGround(4000, 80))
      .addChild(end1 = LevelFactory.MakeEndZone());

    var env2 = new DisplayObjectContainer('testlevel_bottom', '')
      .addChild(tg2a = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 5))
      .addChild(tg2b = LevelFactory.MakeTimedGate(MainGameColor.Neutral, 1.75))
      .addChild(s2a = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(p2 = LevelFactory.MakeGround(4000, 80))
      .addChild(end2 = LevelFactory.MakeEndZone());

    // ground
    p1.position = new Vector(-200, 280);
    p2.position = new Vector(-200, 280);
    // gates
    // the following gates start moving automatically since they aren't sycned with switches
    tg1a.position = tg1a.restPosition = new Vector(200, 70);
    tg1a.targetPosition = tg1a.position.add(new Vector(0, 150));
    tg2a.position = tg2a.restPosition = new Vector(200, 70);
    tg2a.targetPosition = tg2a.position.add(new Vector(0, 150));
    // these gates only start moving once the switch is pressed
    tg1b.position = tg1b.restPosition = new Vector(400, 70);
    tg1b.targetPosition = tg1b.position.add(new Vector(0, 150));
    tg2b.position = tg2b.restPosition = new Vector(500, 220);
    tg2b.targetPosition = tg2b.position.add(new Vector(0, -150));
    s2a.position = new Vector(300, 240);
    tg1b.syncSwitch(s2a);
    tg2b.syncSwitch(s2a);
    // end zones
    end1.position = new Vector(1000, 0);
    end1.dimensions = new Vector(200, 300);
    end2.position = new Vector(1000, 0);
    end2.dimensions = new Vector(200, 300);

    return {
      topLevel: env1,
      topStartPoint: new Vector(50, 50),
      topEndZone: end1,
      topXBounds: [0, 3000],

      bottomLevel: env2,
      bottomStartPoint: new Vector(50, 50),
      bottomEndZone: end2,
      bottomXBounds: [0, 3000],

      gameDuration: 10000,
    };
  }

}
