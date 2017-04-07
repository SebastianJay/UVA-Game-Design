"use strict";

export const enum MainGameActions {
  // player specific actions
  PlayerOneRun,
  PlayerOneJump,
  PlayerOneJumpStop,
  PlayerOneSwap,
  PlayerTwoRun,
  PlayerTwoJump,
  PlayerTwoJumpStop,
  PlayerTwoSwap,
  // UI actions
  Pause,
  // game over options
  EndGameContinue
}
