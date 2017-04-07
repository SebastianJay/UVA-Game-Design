"use strict";

export const enum MainGameAction {
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

export const enum MainGameState {
  InGame,
  EndGameLoss,
}

export const enum MainGameColor {
  Neutral,
  Red,
  Blue
}
