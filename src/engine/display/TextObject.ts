"use strict";

import { DisplayObjectContainer } from './DisplayObjectContainer';
import { Vector } from '../util/Vector';

export class TextObject extends DisplayObjectContainer {

  // TODO font
  private _color : Vector;
  private _text : string;
  private _fontFamily : string;
  private _fontSize : number;

  constructor(id : string) {
    super(id, '');
    this._color = Vector.zero;
    this._text = '';
    this._fontSize = 12;
    this._fontFamily = 'serif';
  }

  draw(g : CanvasRenderingContext2D) : void {
    this.applyTransformations(g);
    g.font = this._fontSize.toString(10) + 'px ' + this._fontFamily;
    g.fillStyle = this.colorToHex;
    g.fillText(this.text, 0, 0);
    this.reverseTransformations(g);
    super.draw(g);  // comes after so children are drawn on top
  }

  get color() : Vector { return this._color; }
  set color(v : Vector) { this._color = v.max(0).min(255); }

  get text() : string { return this._text; }
  set text(s : string) { this._text = s; }

  get fontSize() : number { return this._fontSize; }
  set fontSize(s : number) { this._fontSize = s; }

  get fontFamily() : string { return this._fontFamily; }
  set fontFamily(f : string) { this._fontFamily = f; }

  private get colorToHex() : string {
    return '#' + ("00" + (this.color.r).toString(16)).slice(-2)
      + ("00" + (this.color.g).toString(16)).slice(-2)
      + ("00" + (this.color.b).toString(16)).slice(-2);
  }
}
