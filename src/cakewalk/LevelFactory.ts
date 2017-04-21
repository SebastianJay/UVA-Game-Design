"use strict";

import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { Sprite } from '../engine/display/Sprite';
import { Vector } from '../engine/util/Vector';

import { Platform } from './Platform';
import { Gate } from './Gate';
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
  topLevel : DisplayObjectContainer;
  topStartPoint : Vector;
  topEndZone : TriggerZone;
  topXBounds : [number, number];

  bottomLevel : DisplayObjectContainer;
  bottomStartPoint : Vector;
  bottomEndZone : TriggerZone;
  bottomXBounds : [number, number];

  gameDuration : number;
}

/**
 * Exposes static methods that create levels to be used in the main game
 */
export class LevelFactory {

  /** Call the getter to generate a "GUID" for objects */
  private static _Counter : number = 0;
  private static get Counter() : number {
    return LevelFactory._Counter++;
  }

  /** The following methods create commonly used components */
  private static MakeGround() : Platform {
    return new Platform('ground' + LevelFactory.Counter, 'CakeWalk/tableCombined.png');
  }

  // these are for invisible walls at the bounds of the stage
  // side = 0 -> left wall, side = 1 -> right wall
  private static MakeWall(side : number) : Platform {
    var w = new Platform('wall' + LevelFactory.Counter, '');
    w.width = 50;
    w.height = 2000;
    if (side == 0) {
      w.pivotPoint = new Vector(1.0, 0.0);
    } else if (side == 0) {
      w.pivotPoint = new Vector(0.0, 0.0);
    }
    w.visible = false;
    return w;
  }

  private static MakeCandle(c : MainGameColor = MainGameColor.Neutral) : Platform {
    return new Platform('candle' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'CakeWalk/YellowCandle.png'
      : (c == MainGameColor.Red ? 'CakeWalk/RedCandle.png' : 'CakeWalk/BlueCandle.png'), c);
  }

  private static MakeGate(c : MainGameColor = MainGameColor.Neutral) : Gate {
    return new Gate('gate' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'CakeWalk/YellowCandle.png'
      : (c == MainGameColor.Red ? 'CakeWalk/RedCandle.png' : 'CakeWalk/BlueCandle.png'), c);
  }

  private static MakeFlame(c : MainGameColor = MainGameColor.Neutral) : Flame {
    return new Flame('flame' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'animations/YellowFlameSprite.png'
      : (c == MainGameColor.Red ? 'animations/RedFlameSprite.png' : 'animations/BlueFlameSprite.png'), c, 3);
  }

  // TODO no neutral switch sprite
  private static MakeSwitch(c : MainGameColor = MainGameColor.Neutral) : Switch {
    return new Switch('switch' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'CakeWalk/RedButton.png'
      : (c == MainGameColor.Red ? 'CakeWalk/RedButton.png' : 'CakeWalk/BlueButton.png'), c);
  }

  private static MakeEndZone() : TriggerZone {
    var z = new TriggerZone('end' + LevelFactory.Counter)
    z.addChild(new Sprite(z.id+'_post', 'CakeWalk/goalpost.png'));
    z.getChild(0).pivotPoint = new Vector(1.0, 0.0);  // zone only appears after right edge of goal stripe
    return z;
  }

  private static MakeCheckpoint() : Checkpoint {
    var c = new Checkpoint('checkpoint' + LevelFactory.Counter);
    c.dimensions = new Vector(100, 720 / 2);
    c.addChild(new Sprite(c.id+'_post', 'CakeWalk/cake2.png'));
    c.getChild(0).position = new Vector(0, 0);
    c.getChild(0).localScale = new Vector(0.3, 0.3);
    return c;
  }

  /**
   * Given which level the player is on (indexed starting from 0),
   *  creates the display tree for those levels.
   * Ideally, levels starting from a certain number will be procedurally generated.
   */
  static GetLevel(num : number) {
    return LevelFactory.GetLevelZero();
  }

  // first level - tutorial
  private static GetLevelZero() : LevelParams {
    // p1 and p2 are ground for each stage
    var p1: Platform, p2: Platform;
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
    var g1a: Gate, g1b: Gate;
    var s1a: Switch;
    var g2a: Gate;
    var s2a: Switch, s2b: Switch;
    var q1a: Checkpoint, q1b: Checkpoint;
    var q2a: Checkpoint, q2b: Checkpoint;
    // trigger zones for end of level
    var end1: TriggerZone, end2: TriggerZone;

    var env1 = new DisplayObjectContainer('level0_top', '')
      .addChild(b1start = LevelFactory.MakeWall(0))
      .addChild(b1end = LevelFactory.MakeWall(1))
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
      .addChild(p1 = LevelFactory.MakeGround())
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
      .addChild(end1 = LevelFactory.MakeEndZone());

    var env2 = new DisplayObjectContainer('level0_bottom', '')
      .addChild(b2start = LevelFactory.MakeWall(0))
      .addChild(b2end = LevelFactory.MakeWall(1))
      .addChild(c2a = LevelFactory.MakeCandle(MainGameColor.Neutral))
      .addChild(c2b = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c2c = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c2d = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(c2e = LevelFactory.MakeCandle(MainGameColor.Blue))
      .addChild(c2f = LevelFactory.MakeCandle(MainGameColor.Red))
      .addChild(g2a = LevelFactory.MakeGate(MainGameColor.Neutral))
      .addChild(s2a = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(s2b = LevelFactory.MakeSwitch(MainGameColor.Blue))
      .addChild(q2a = LevelFactory.MakeCheckpoint())
      .addChild(q2b = LevelFactory.MakeCheckpoint())
      .addChild(p2 = LevelFactory.MakeGround())
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
      .addChild(end2 = LevelFactory.MakeEndZone());

    // ground
    p1.position = new Vector(0, 280);
    p1.width = 4000;
    p1.height = 80;
    p2.position = new Vector(0, 280);
    p2.width = 4000;
    p2.height = 80;
    // invisible walls
    b1start.position = new Vector(-50,-500);
    b1end.position = new Vector(3000,-500);
    b2start.position = new Vector(-50,-500);
    b2end.position = new Vector(3000,-500);
    //first obstacle
    c1a.position = new Vector(250,220);
    c2a.position = new Vector(250,220);
    //second obstacle
    f1a.position = new Vector(600, 220);
    f2a.position = new Vector(600, 220);
    //third obstacle
    c1b.position = new Vector(900,180);
    c2b.position = new Vector(900,180);
    //fourth obstacle
    c1c.position = new Vector(1100,180);
    c2c.position = new Vector(1100,180);
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
    s2a.position = new Vector(2200, 250);
    s2a.localScale = new Vector(0.3, 0.3);
    g1a.syncSwitch(s2a);
    // 2nd checkpoint
    q1b.position = new Vector(2300, 0);
    q1b.spawnPoint = new Vector(2300, 220);
    q2b.position = new Vector(2300, 0);
    q2b.spawnPoint = new Vector(2300, 220);
    //eighth obstacle
    c1d.position = new Vector(2400,230);
    c1e.position = new Vector(2450,180);
    c1f.position = new Vector(2500,130);
    c2d.position = new Vector(2400,230);
    c2e.position = new Vector(2450,180);
    c2f.position = new Vector(2500,150);
    f1n.position = new Vector(2400,240);
    f1o.position = new Vector(2450,190);
    f1p.position = new Vector(2500,140);
    f2n.position = new Vector(2400,240);
    f2o.position = new Vector(2450,190);
    f2p.position = new Vector(2500,140);
    g1b.restPosition = g1b.position = new Vector(2550, 40);
    g1b.targetPosition = g1b.position.add(new Vector(0, -150));
    s2b.position = new Vector(2500, 130);
    s2b.localScale = new Vector(0.3, 0.3);
    g1b.syncSwitch(s2b);
    g2a.restPosition = g2a.position = new Vector(2550, 40);
    g2a.targetPosition = g2a.position.add(new Vector(0, 150));
    s1a.position = new Vector(2700, 250);
    s1a.localScale = new Vector(0.3, 0.3);
    g2a.syncSwitch(s1a);
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

      bottomLevel :env2,
      bottomStartPoint: new Vector(50, 50),
      bottomEndZone: end2,
      bottomXBounds: [0, 3000],

      gameDuration: 100,
    };
  }
}
