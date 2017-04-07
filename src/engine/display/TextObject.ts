"use strict";

import { DisplayObjectContainer } from './DisplayObjectContainer';
import { Vector } from '../util/Vector';

export class TextObject extends DisplayObjectContainer {

  // TODO font
  private _color : Vector;
  private _text : string;

  constructor(id : string) {
    super(id, '');
    this._color = Vector.zero;
    this._text = '';
  }

  draw(g : CanvasRenderingContext2D) : void {
    this.applyTransformations(g);
    g.font = '48px serif'; // replace
    g.fillStyle = this.colorToHex;
    g.fillText(this.text, 0, 0);
    this.reverseTransformations(g);
    super.draw(g);  // comes after so children are drawn on top
  }

  get color() : Vector { return this._color; }
  set color(v : Vector) { this._color = v.max(0).min(255); }

  get text() : string { return this._text; }
  set text(s : string) { this._text = s; }

  private get colorToHex() : string {
    return '#' + ("00" + (this.color.r).toString(16)).slice(-2)
      + ("00" + (this.color.g).toString(16)).slice(-2)
      + ("00" + (this.color.b).toString(16)).slice(-2);
  }
}
