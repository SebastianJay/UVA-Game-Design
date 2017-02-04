"use strict";

import { Vector } from '../util/Vector'

/** Mappings from readable metakeys and mouse buttons to numbers used in DOM events */
export const enum InputKeyCode {
  Left  =37,
  Up    =38,
  Right =39,
  Down  =40,
}

export const enum InputMouseButton {
  Left  =0,
  Right =2,
  Middle=1,
}
