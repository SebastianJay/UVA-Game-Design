"use strict";

import { Sprite } from '../engine/display/Sprite';
import { MainGameColor } from './MainGameEnums';

export class MainGameSprite extends Sprite {
  constructor(id : string, filename : string, private _color : MainGameColor) {
    super(id, filename);
  }

  get color() : MainGameColor { return this._color; }
  set color(c : MainGameColor) { this._color = c; }
}

export interface IRefreshable {
  refreshState : () => void;
}

export function isRefreshable(o : any) : o is IRefreshable {
  return 'refreshState' in o;
}
