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
  // the following fields are used to transition from one song to another
  private currentSongId : string;
  private nextSongId : string;
  private isFading : boolean;
  private fadeTimeout : number;
  private fadeTimer : number;

  private constructor() {
    this.soundHash = {};
    this.currentSongId = '';
    this.nextSongId = '';
    this.isFading = false;
    this.fadeTimer = 0;
    this.fadeTimeout = 0;
  }
  public static get instance() : SoundManager
  {
    return this._instance || (this._instance = new this());
  }

  update(dt : number = 0) {
    if (this.isFading && this.currentSongId in this.soundHash) {
      this.fadeTimer += dt;
      if (this.fadeTimer > this.fadeTimeout) {
        this.soundHash[this.currentSongId].audio.pause();
        this.soundHash[this.currentSongId].audio.volume = 1.0;
        this.soundHash[this.nextSongId].audio.currentTime = 0.0;
        this.playMusic(this.nextSongId);
        this.currentSongId = this.nextSongId;
        this.isFading = false;
      } else {
        this.soundHash[this.currentSongId].audio.volume = Math.min(1.0, Math.max(0.0, 1.0 - (this.fadeTimer / this.fadeTimeout)));
      }
    }
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
    this.currentSongId = id;
  }

  fadeToNext(id : string, fadeTime : number) : void {
    this.fadeTimeout = fadeTime;
    this.fadeTimer = 0.0;
    this.nextSongId = id;
    this.isFading = true;
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
