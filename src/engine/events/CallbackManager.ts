'use strict';

type Action = () => void;
export class CallbackManager {
  // singleton pattern
  private static _instance : CallbackManager;
  public static get instance() : CallbackManager
  {
    return this._instance || (this._instance = new this());
  }

  // list contains time remaining, time total, whether action is cyclic, and callback itself
  private callbackLst : [number, number, boolean, Action][];
  private constructor() {
    this.callbackLst = [];
  }

  update(dt : number) {
    var newLst = [];
    for (var i = 0; i < this.callbackLst.length; i+=1) {
      this.callbackLst[i][0] -= dt;
      if (this.callbackLst[i][0] <= 0) {
        this.callbackLst[i][3](); // execute callback
        if (this.callbackLst[i][2]) {
          // action is cyclic, so just reset the time remaining
          this.callbackLst[i][0] += this.callbackLst[i][1];
        } else {
          // action is not cyclic, so remove it from list (by not appending to newLst)
          continue;
        }
      }
      newLst.push(this.callbackLst[i]);
    }
    this.callbackLst = newLst;
  }

  addCallback(action : Action, timeout : number, cyclic : boolean = false) {
    this.callbackLst.push([timeout, timeout, cyclic, action]);
  }
}
