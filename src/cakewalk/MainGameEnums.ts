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
  // general player actions
  Pause,
  // menu actions
  MenuConfirm,
  MenuUp,
  MenuDown,
  // game over (win/loss) options
  EndGameContinue
}

export const enum MainGameState {
  Loading,
  MenuOpen,
  InGame,
  EndGameWin,
  EndGameLoss,
}

export const enum MainGameColor {
  Neutral,
  Red,
  Blue
}
