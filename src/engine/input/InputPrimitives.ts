"use strict";

/** Mappings from readable metakeys to numbers used in DOM events */
export const enum InputKeyCode {
  // arrow keys
  Left  =37,
  Up    =38,
  Right =39,
  Down  =40,
  // whitespace keys, these correspond to strings, but putting them in enum is clearer
  Return=13,
  Tab   =9,
  Space =32,
  // meta keys
  Shift =16,
  Ctrl  =17,
  Alt   =18,
  // function keys
  F1    =112,
  F2    =113,
  F3    =114,
  F5    =115,
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
