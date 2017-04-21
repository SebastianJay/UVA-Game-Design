'use strict';

import { Sprite } from '../engine/display/Sprite';
import { DisplayObject } from '../engine/display/DisplayObject';
import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { TextObject } from '../engine/display/TextObject';
import { Vector } from '../engine/util/Vector';

export class MenuUI extends Sprite {

  private _cursor : Sprite;
  private _optionIndex : number;
  private _menuIndex : number;
  private _gameStartCallback : () => void;

  constructor(id : string, filename : string) {
    super(id, filename);

    // add display tree of option text and cursor
    var t0 : TextObject, t1 : TextObject, t2 : TextObject;
    var tn0 : TextObject, tn1 : TextObject, tn2 : TextObject;
    this.addChild(this._cursor = new Sprite(id+'_cursor', 'CakeWalk/cake2.png'))
    .addChild(new DisplayObjectContainer(id+'_mainmenu', '')
      .addChild(new DisplayObjectContainer(id+'mainmenu_options', '')
        .addChild(t0 = new TextObject(id+'_t0'))
        .addChild(t1 = new TextObject(id+'_t1'))
      )
    ).addChild(new DisplayObjectContainer(id+'_credits', '')
      .addChild(new DisplayObjectContainer(id+'_credits_options', '')
        .addChild(t2 = new TextObject(id+'_t2'))
      ).addChild(tn0 = new TextObject(id+'_tn0'))
      .addChild(tn1 = new TextObject(id+'_tn1'))
      .addChild(tn2 = new TextObject(id+'_tn2'))
    );

    t0.position = new Vector(1280 / 2 - 100, 350);
    t0.text = 'Play Game!';
    t1.position = new Vector(1280 / 2 - 100, 400);
    t1.text = 'Credits';
    t2.position = new Vector(1280 / 2 - 100, 550);
    t2.text = 'Go Back';
    tn0.position = new Vector(1280 / 2 - 100, 350);
    tn0.text = 'Jeffery Cui';
    tn1.position = new Vector(1280 / 2 - 100, 400);
    tn1.text = 'Alec Miller';
    tn2.position = new Vector(1280 / 2 - 100, 450);
    tn2.text = 'Jay Sebastian';

    [t0, t1, t2, tn0, tn1, tn2].map((t : TextObject) => {
      t.color = new Vector(0, 0, 0);
    });

    this._cursor.position = new Vector(1280 / 2 - 150, 350);
    this._cursor.pivotPoint = new Vector(0.5, 0.8);
    this._cursor.localScale = new Vector(0.3, 0.3);

    this._optionIndex = 0;
    this._menuIndex = 0;
    // hide all menus but first one
    this.getChild(2).visible = false;
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
        if (this._gameStartCallback != null) {
          this._gameStartCallback();
        }
      } else if (this._optionIndex == 1) {
        this.menuChange(1);
      }
    } else if (this._menuIndex == 1) {
      // credits menu
      this.menuChange(0);
    }
  }

  registerGameStartCallback(callback : () => void) {
    this._gameStartCallback = callback;
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
