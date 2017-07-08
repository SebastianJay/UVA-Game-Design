'use strict';

import { Sprite } from '../engine/display/Sprite';
import { DisplayObject } from '../engine/display/DisplayObject';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { TextObject } from '../engine/display/TextObject';
import { Vector } from '../engine/util/Vector';
import { SoundManager } from '../engine/sound/SoundManager';

export class MenuUI extends Sprite {

  private _cursor : Sprite;
  private _optionIndex : number;
  private _menuIndex : number;
  private _gameStartCallback : (levelNumber : number) => void;
  private _gameResumeCallback : () => void;
  private _gameStarted : boolean;
  private _startButton : TextObject; // reference to start game option which changes value
  private _muteMusicButton : TextObject; // reference to mute music option which changes value
  private _muteFXButton : TextObject; // reference to mute FX option which changes value

  constructor(id : string, filename : string) {
    super(id, filename);

    // add display tree of option text and cursor
    var t0 : TextObject, t1 : TextObject, t2 : TextObject,
      t3 : TextObject, t4 : TextObject, t5 : TextObject, t6 : TextObject,
      t7 : TextObject, t8 : TextObject, t9 : TextObject, t10 : TextObject, t11 : TextObject, t12 : TextObject;
    var tn0 : TextObject, tn1 : TextObject, tn2 : TextObject,
      tn3 : TextObject, tn4 : TextObject, tn5 : TextObject, tn6 : TextObject, tn7 : TextObject;
    this.addChild(this._cursor = new Sprite(id+'_cursor', 'CakeWalk/cake_small.png'))
    .addChild(new DisplayObjectContainer(id+'_mainmenu', '')
      .addChild(new DisplayObjectContainer(id+'mainmenu_options', '')
        .addChild(this._startButton = t0 = new TextObject(id+'_t0'))
        .addChild(t1 = new TextObject(id+'_t1'))
        .addChild(t11 = new TextObject(id+'_t11'))
        .addChild(t2 = new TextObject(id+'_t2'))
      )
    ).addChild(new DisplayObjectContainer(id+'_sound', '')
      .addChild(new DisplayObjectContainer(id+'_sound_options', '')
        .addChild(this._muteMusicButton = t3 = new TextObject(id+'_t3'))
        .addChild(this._muteFXButton = t4 = new TextObject(id+'_t4'))
        .addChild(t5 = new TextObject(id+'_t5'))
      )
    ).addChild(new DisplayObjectContainer(id+'_levels', '')
      .addChild(new DisplayObjectContainer(id+'_levels_options', '')
        .addChild(t7 = new TextObject(id+'_t7'))
        .addChild(t8 = new TextObject(id+'_t8'))
        .addChild(t9 = new TextObject(id+'_t9'))
        .addChild(t12 = new TextObject(id+'_t12'))
        .addChild(t10 = new TextObject(id+'_t10'))
      )
    ).addChild(new DisplayObjectContainer(id+'_credits', '')
      .addChild(new DisplayObjectContainer(id+'_credits_options', '')
        .addChild(t6 = new TextObject(id+'_t6'))
      ).addChild(tn0 = new TextObject(id+'_tn0'))
      .addChild(tn1 = new TextObject(id+'_tn1'))
      .addChild(tn2 = new TextObject(id+'_tn2'))
      .addChild(tn3 = new TextObject(id+'_tn3'))
      .addChild(tn4 = new TextObject(id+'_tn4'))
      .addChild(tn5 = new TextObject(id+'_tn5'))
      .addChild(tn6 = new TextObject(id+'_tn6'))
      .addChild(tn7 = new TextObject(id+'_tn7'))
    );

    t0.position = new Vector(1280 / 2 - 100, 350);
    t0.text = 'Play Game!';
    t1.position = new Vector(1280 / 2 - 100, 400);
    t1.text = 'Sound';
    t11.position = new Vector(1280 / 2 - 100, 450);
    t11.text = 'Level Select';
    t2.position = new Vector(1280 / 2 - 100, 500);
    t2.text = 'Credits';
    t3.position = new Vector(1280 / 2 - 125, 350);
    t3.text = 'Mute Music';
    t4.position = new Vector(1280 / 2 - 200, 400);
    t4.text = 'Mute Sound Effects';
    t5.position = new Vector(1280 / 2 - 100, 550);
    t5.text = 'Go Back';
    t6.position = new Vector(1280 / 2 - 100, 550);
    t6.text = 'Go Back';
    t7.position = new Vector(1280 / 2 - 100, 350);
    t7.text = 'Short';
    t8.position = new Vector(1280 / 2 - 100, 400);
    t8.text = 'Pound';
    t9.position = new Vector(1280 / 2 - 100, 450);
    t9.text = 'Cheese';
    t12.position = new Vector(1280 / 2 - 100, 500);
    t12.text = 'Sponge';
    t10.position = new Vector(1280 / 2 - 100, 550);
    t10.text = 'Go Back';

    tn0.position = new Vector(1280 / 2 - 430, 325);
    tn0.text = 'Jeffery Cui';
    tn1.position = new Vector(1280 / 2 - 150, 325);
    tn1.text = 'Alec Miller';
    tn2.position = new Vector(1280 / 2 + 130, 325);
    tn2.text = 'Jay Sebastian';
    tn3.position = new Vector(1280 / 2 - 250, 375);
    tn3.text = 'Short Skirt Long Jacket - Cake, arranged by 8bitmusic';
    tn4.position = new Vector(1280 / 2 - 250, 400);
    tn4.text = 'Atop a Cake - Alvvays, arranged by UnivMead';
    tn5.position = new Vector(1280 / 2 - 250, 425);
    tn5.text = 'Cake by the Ocean - DNCE, arranged by Ion';
    tn6.position = new Vector(1280 / 2 - 250, 450);
    tn6.text = 'The Distance - Cake, arranged by TheMusickGuy';
    tn7.position = new Vector(1280 / 2 - 250, 475);
    tn7.text = 'Cake - Melanie Martinez, arranged by ZaneDobler';

    [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, tn0, tn1, tn2].map((t : TextObject) => {
      t.color = new Vector(0, 0, 0);
      t.fontSize = 48;
      t.fontFamily = 'Sanchez';
    });
    [tn3, tn4, tn5, tn6, tn7].map((t : TextObject) => {
      t.color = new Vector(0, 0, 0);
      t.fontSize = 20;
      t.fontFamily = 'Sanchez';
    });

    this._cursor.position = new Vector(1280 / 2 - 150, 350);
    this._cursor.pivotPoint = new Vector(0.5, 0.90);

    this._gameStarted = false;
    this._optionIndex = 0;
    this._menuIndex = 0;
    // hide all menus but first one
    for(var i = 2; i < this.children.length; i++) {
      this.getChild(i).visible = false;
    }
  }

  update(dt : number = 0) : void{
    super.update(dt);
    this._cursor.position = this.optionFocus.position.subtract(new Vector(50, 0));
  }

  /** Scroll down the list of options on the menu */
  menuScroll(down : boolean) : void {
    // get the number of options in our current menu list
    var menuLength = (<DisplayObjectContainer>(<DisplayObjectContainer>this.getChild(this._menuIndex + 1)).getChild(0)).children.length;
    // if down true, we scroll down, otherwise we go up
    if (down) {
      this._optionIndex = (this._optionIndex + 1) % menuLength;
    } else {
      this._optionIndex = (this._optionIndex - 1);
      if (this._optionIndex < 0) {
        this._optionIndex += menuLength;
      }
    }
  }

  menuAction() : void {
    if (this._menuIndex == 0) {
      // main menu
      if (this._optionIndex == 0) {
        if (!this._gameStarted) {
          if (this._gameStartCallback != null) {
            this._gameStartCallback(0);
          }
        } else {
          if (this._gameResumeCallback != null) {
            this._gameResumeCallback();
          }
        }
      } else if (this._optionIndex == 1) {
        this.menuChange(1);
      } else if (this._optionIndex == 2) {
        this.menuChange(2);
      } else if (this._optionIndex == 3) {
        this.menuChange(3);
      }
    } else if (this._menuIndex == 1) {
      // sound menu
      if (this._optionIndex == 0) {
        SoundManager.instance.setMusicMuted(!SoundManager.instance.isMusicMuted());
        this._muteMusicButton.text = SoundManager.instance.isMusicMuted() ? 'Unmute Music' : 'Mute Music';
      } else if (this._optionIndex == 1) {
        SoundManager.instance.setFXMuted(!SoundManager.instance.isFXMuted());
        this._muteFXButton.text = SoundManager.instance.isFXMuted() ? 'Unmute Sound Effects' : 'Mute Sound Effects';
      } else {
        this.menuChange(0);
      }
    } else if (this._menuIndex == 2) {
      // level select
      if (this._optionIndex == 4) {
        this.menuChange(0);
      } else {
        // start level with given index
        this._gameStartCallback(this._optionIndex);
      }
    } else if (this._menuIndex == 3) {
      // credits menu
      this.menuChange(0);
    }
  }

  registerGameStartCallback(callback : (levelNumber : number) => void) : void{
    this._gameStartCallback = callback;
  }

  registerGameResumeCallback(callback: () => void) : void {
    this._gameResumeCallback = callback;
  }

  setGameStarted() : void {
    this._gameStarted = true;
    this._startButton.text = 'Resume Game';
  }

  reset() : void {
    this._optionIndex = 0;
    this._menuIndex = 0;
    this.getChild(1).visible = true;
    for(var i = 2; i < this.children.length; i++) {
      this.getChild(i).visible = false;
    }
  }

  private menuChange(newInd : number) {
    this.getChild(this._menuIndex + 1).visible = false;
    this.getChild(newInd + 1).visible = true;
    this._menuIndex = newInd;
    this._optionIndex = 0;
  }

  private get optionFocus() : DisplayObject {
    return (<DisplayObjectContainer>(<DisplayObjectContainer>this.getChild(this._menuIndex + 1)).getChild(0)).getChild(this._optionIndex);
  }
}
