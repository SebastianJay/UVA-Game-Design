"use strict";

import { Vector } from '../util/Vector'

/** Mappings from readable metakeys to numbers used in DOM events */
export const enum InputKeyCode {
  Left  =37,
  Up    =38,
  Right =39,
  Down  =40,
}

/** Mapping mouse buttons to numbers used in DOM events */
export const enum InputMouseButton {
  Left  =0,
  Right =2,
  Middle=1,
}

/** Mapping Xbox Gamepad buttons to numbers used in DOM events */
export const enum InputGamepadButton {
  A     =0,
  B     =1,
  X     =2,
  Y     =3,
  LB    =4,
  RB    =5,
  LT    =6,
  RT    =7,
  Back  =8,
  Start =9,
  LeftJoystick  =10,
  RightJoystick =11,
  DpadUp  =12,
  DpadDown=13,
  DpadLeft=14,
  DpadRight=15,
}

/** Enumeration of Left and Right joystick horizontal and vertical axes */
export const enum InputGamepadAxis {
  LeftHorizontal,
  LeftVertical,
  RightHorizontal,
  RightVertical,
}
