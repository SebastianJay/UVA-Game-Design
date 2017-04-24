"use strict";

import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { TiledSpriteContainer } from '../engine/display/TiledSpriteContainer';
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
  /** The ground shall be tiled in the x direction to span the given width */
  private static MakeGround(width : number, height : number) : TiledSpriteContainer {
    return new TiledSpriteContainer('ground' + LevelFactory.Counter, 'CakeWalk/tableCombined.png', width, height,
      (id: string, filename: string) => {
        return new Platform(id, filename);
      }
    );
  }

  // these are for invisible walls at the bounds of the stage
  private static MakeWall() : Platform {
    var w = new Platform('wall' + LevelFactory.Counter, '');
    w.width = 50;
    w.height = 2000;
    w.visible = false;
    return w;
  }

  private static MakeCandle(c : MainGameColor = MainGameColor.Neutral) : Platform {
    return new Platform('candle' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'CakeWalk/YellowCandle.png'
      : (c == MainGameColor.Red ? 'CakeWalk/RedCandle.png' : 'CakeWalk/BlueCandle.png'), c);
  }
  private static MakeCandleHoriz(c : MainGameColor = MainGameColor.Neutral) : Platform {
    return new Platform('candle' + LevelFactory.Counter,
      c == MainGameColor.Neutral ? 'CakeWalk/YellowCandleRotated.png'
      : (c == MainGameColor.Red ? 'CakeWalk/RedCandleRotated.png' : 'CakeWalk/BlueCandleRotated.png'), c);
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
    return LevelFactory.GetLevelTwo();
  }

  // first level - tutorial
  private static GetLevelOne() : LevelParams {
    // p1 and p2 are ground for each stage
    var p1: TiledSpriteContainer, p2: TiledSpriteContainer;
    var p1a: TiledSpriteContainer;
    var p2a: TiledSpriteContainer;
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
      .addChild(p1a = LevelFactory.MakeGround(400, 140))
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
      .addChild(b2start = LevelFactory.MakeWall())
      .addChild(b2end = LevelFactory.MakeWall())
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
      .addChild(end2 = LevelFactory.MakeEndZone());

    // ground
    p1.position = new Vector(-200, 280);
    p2.position = new Vector(-200, 280);
    // invisible walls
    b1start.position = new Vector(-50,-500);
    b1end.position = new Vector(3000,-500);
    b2start.position = new Vector(-50,-500);
    b2end.position = new Vector(3000,-500);
    //first obstacle
    p1a.position = new Vector(250,150);
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
    g1b.restPosition = g1b.position = new Vector(2550, 25);
    g1b.targetPosition = g1b.position.add(new Vector(0, -150));
    s2b.position = new Vector(2500, 130);
    s2b.localScale = new Vector(0.3, 0.3);
    g1b.syncSwitch(s2b);
    g2a.restPosition = g2a.position = new Vector(2550, 25);
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

      gameDuration: 10000,
    };
  }

//level 2
private static GetLevelTwo() : LevelParams {
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
    f1r: Flame, f1s: Flame, f1t: Flame,  f1u: Flame,
    f1bb: Flame, f1cc: Flame, f1dd: Flame, f1ee: Flame, f1ff: Flame, f1gg: Flame, f1hh: Flame,
    f1ii: Flame, f1jj: Flame, f1kk: Flame, f1ll: Flame, f1mm: Flame, f1nn: Flame, f1oo: Flame, f1pp: Flame,
    f1qq: Flame, f1rr: Flame, f1ss: Flame, f1tt: Flame,  f1uu: Flame;

  var f2a: Flame, f2b: Flame, f2c: Flame, f2d: Flame, f2e: Flame, f2f: Flame, f2g: Flame, f2h: Flame,
    f2i: Flame, f2j: Flame, f2k: Flame, f2l: Flame, f2m: Flame, f2n: Flame, f2o: Flame, f2p: Flame, f2q: Flame,
    f2r: Flame, f2s: Flame, f2t: Flame,  f2u: Flame,
    f2bb: Flame, f2cc: Flame, f2dd: Flame, f2ee: Flame, f2ff: Flame, f2gg: Flame, f2hh: Flame,
    f2ii: Flame, f2jj: Flame, f2kk: Flame, f2ll: Flame, f2mm: Flame, f2nn: Flame, f2oo: Flame, f2pp: Flame,
    f2qq: Flame, f2rr: Flame, f2ss: Flame, f2tt: Flame,  f2uu: Flame;


  var q1a: Checkpoint;
  var q2a: Checkpoint;
  // trigger zones for end of level
  var end1: TriggerZone, end2: TriggerZone;

  var env1 = new DisplayObjectContainer('level0_top', '')
    .addChild(b1start = LevelFactory.MakeWall())
    .addChild(b1end = LevelFactory.MakeWall())
    .addChild(c1a = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
    .addChild(c1b = LevelFactory.MakeCandle(MainGameColor.Blue))
    .addChild(c1c = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
    .addChild(c1d = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
    .addChild(c1e = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
    .addChild(c1f = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
    .addChild(c1g = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
    //.addChild(c1h = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
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
    .addChild(f1i = LevelFactory.MakeFlame(MainGameColor.Neutral))
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
    .addChild(f1uu= LevelFactory.MakeFlame(MainGameColor.Neutral))
    .addChild(end1 = LevelFactory.MakeEndZone());

  var env2 = new DisplayObjectContainer('level0_bottom', '')
    .addChild(b2start = LevelFactory.MakeWall())
    .addChild(b2end = LevelFactory.MakeWall())
    .addChild(c2a = LevelFactory.MakeCandleHoriz(MainGameColor.Neutral))
    .addChild(c2b = LevelFactory.MakeCandle(MainGameColor.Red))
    .addChild(c2c = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
    .addChild(c2d = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
    .addChild(c2e = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
    .addChild(c2f = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
    .addChild(c2g = LevelFactory.MakeCandleHoriz(MainGameColor.Blue))
    //.addChild(c2h = LevelFactory.MakeCandleHoriz(MainGameColor.Red))
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
    .addChild(f2i = LevelFactory.MakeFlame(MainGameColor.Neutral))
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
    .addChild(f2uu= LevelFactory.MakeFlame(MainGameColor.Neutral))
    .addChild(end2 = LevelFactory.MakeEndZone());

  // ground
  p1.position = new Vector(-200, 280);
  p2.position = new Vector(-200, 280);
  // invisible walls
  b1start.position = new Vector(-50,-500);
  b1end.position = new Vector(3000,-500);
  b2start.position = new Vector(-50,-500);
  b2end.position = new Vector(3000,-500);
  //first obstacle
  f1a.position = new Vector(50, 150);
  f2a.position = new Vector(50, 150);

  //second obstacle
  c1a.position = new Vector(300,190);
  c2a.position = new Vector(300,190);
  c1b.position = new Vector(600, 80);
  c2b.position = new Vector(600, 80);
  c1c.position = new Vector(750,190);
  c2c.position = new Vector(750,190);
  c1d.position = new Vector(775,190);
  c2d.position = new Vector(775,190);
  q1a.position = new Vector(800, 0);
  q1a.spawnPoint = new Vector(800, 110);
  q2a.position = new Vector(800, 0);
  q2a.spawnPoint = new Vector(800, 110);

  //third obstacle
  c1e.position = new Vector(1200,160);
  c2e.position = new Vector(1200,160);
  c1f.position = new Vector(1600, 120);
  c2f.position = new Vector(1600, 120);
  c1g.position = new Vector(2050, 80);
  c2g.position = new Vector(2050, 80);
  //c1h.position = new Vector(2400,500);
  //c2h.position = new Vector(2400,50);


  //fourth obstacle

  // checkpoint 1

  //fire floor
  f1b.position = new Vector(450, 220);
  f1c.position = new Vector(500, 220);
  f1d.position = new Vector(550, 220);
  f1e.position = new Vector(600, 220);
  f1f.position = new Vector(650, 220);
  f1g.position = new Vector(700, 220);
  f1h.position = new Vector(750, 220);
  f1i.position = new Vector(800, 220);
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
  f2i.position = new Vector(800, 220);
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

    bottomLevel :env2,
    bottomStartPoint: new Vector(50, 50),
    bottomEndZone: end2,
    bottomXBounds: [0, 3000],

    gameDuration: 10000,
  };
}

}