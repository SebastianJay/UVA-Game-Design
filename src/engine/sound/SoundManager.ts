"use strict";

type SoundConfig = {
  loaded: boolean,
  playOnLoad: boolean,
  loopCount: number,
  audio: HTMLAudioElement,
};

export class SoundManager {
  private static _instance : SoundManager;
  private soundHash : {[id: string]: SoundConfig };

  private constructor() {
    this.soundHash = {};
  }
  public static get instance() : SoundManager
  {
    return this._instance || (this._instance = new this());
  }

  loadSound(id : string, filename : string) : void {
    if (filename) {
      this.soundHash[id] = {
        loaded: false,
        playOnLoad: false,
        loopCount: 0,
        audio: new Audio(),
      };
      var t = this;
      this.soundHash[id].audio.onloadstart = () => {
        t.soundHash[id].loaded = true;
        if (t.soundHash[id].playOnLoad) {
          t.soundHash[id].audio.play();
        }
      };
      this.soundHash[id].audio.onended = () => {
        if (t.soundHash[id].loopCount != 0) {
          t.soundHash[id].loopCount -= 1;
          t.soundHash[id].audio.play();
        }
      };
      this.soundHash[id].audio.src = 'resources/' + filename;
    }
  }

  playFX(id : string) : void {
    this.playSound(id, 0);
  }

  playMusic(id : string, loop: number = -1) : void {
    this.playSound(id, loop);
  }

  private playSound(id : string, loop : number) : void {
    if (!(id in this.soundHash)) {
      return; // need to call loadSound() first
    }
    this.soundHash[id].loopCount = loop;
    if (this.soundHash[id].loaded) {
      this.soundHash[id].audio.play();
    } else {
      this.soundHash[id].playOnLoad = true;
    }
  }
}
