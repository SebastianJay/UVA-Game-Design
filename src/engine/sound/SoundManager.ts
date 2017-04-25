"use strict";

type SoundConfig = {
  loaded: boolean,
  playOnLoad: boolean,
  loopCount: number,
  audio: HTMLAudioElement,
};

/**
 * SoundManager is a singleton which handles playing background music and sound
 * effects in a game. Call loadSound() when constructing the game on all sound files
 * you'll need and then play them with playFX() or playMusic()
 */
export class SoundManager {
  private static _instance : SoundManager;
  private mutedMusic : boolean;
  private mutedFX : boolean;
  private soundHash : {[id: string]: SoundConfig };
  // the following fields are used to transition from one song to another
  private currentSongId : string;
  private nextSongId : string;
  private isFading : boolean;
  private fadeTimeout : number;
  private fadeTimer : number;

  private constructor() {
    this.mutedMusic = false;
    this.mutedFX = false;
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
    if (this.isFading) {
      this.fadeTimer += dt;
      if (this.fadeTimer > this.fadeTimeout) {
        if (this.currentSongId in this.soundHash) {
          this.soundHash[this.currentSongId].audio.pause();
        }
        this.playMusic(this.nextSongId);
        this.currentSongId = this.nextSongId;
        this.isFading = false;
      } else {
        if (this.currentSongId in this.soundHash && !this.isMusicMuted()) {
          this.soundHash[this.currentSongId].audio.volume = Math.min(1.0, Math.max(0.0, 1.0 - (this.fadeTimer / this.fadeTimeout)));
        }
      }
    }
  }

  /** Load a sound effect from a file and associate it with given id */
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

  /** Play a sound effect */
  playFX(id : string) : void {
    if (!this.isFXMuted()) {
      this.playSound(id, 0);
    }
  }

  /** Play background music */
  playMusic(id : string, loop: number = -1) : void {
    if (!this.isMusicMuted()) {
      this.playSound(id, loop);
      this.currentSongId = id;
    }
  }

  /** Fades out the current song in fadeTime seconds and then plays song with given id */
  fadeToNext(id : string, fadeTime : number) : void {
    if (id != this.currentSongId) {
      this.fadeTimeout = fadeTime;
      this.fadeTimer = 0.0;
      this.nextSongId = id;
      this.isFading = true;
    }
  }

  /** Sets muted status of FX. If true, then calls to playFX() do nothing. */
  setFXMuted(muted : boolean) {
    this.mutedFX = muted;
  }

  /** Sets muted status of music. If true, then calls to playMusic() do nothing.
    Also, any track currently playing will pause. */
  setMusicMuted(muted : boolean) {
    this.mutedMusic = muted;
    if (this.isMusicMuted()) {
      if (this.currentSongId in this.soundHash) {
        this.soundHash[this.currentSongId].audio.pause();
      }
    } else {
      this.playMusic(this.currentSongId);
    }
  }

  isFXMuted() : boolean { return this.mutedFX; }
  isMusicMuted() : boolean { return this.mutedMusic; }

  private playSound(id : string, loop : number) : void {
    if (!(id in this.soundHash)) {
      return; // sound needs to be loaded
    }
    this.soundHash[id].loopCount = loop;
    if (this.soundHash[id].loaded) {
      // start from beginning of track at full volume
      this.soundHash[id].audio.currentTime = 0.0;
      this.soundHash[id].audio.volume = 1.0;
      this.soundHash[id].audio.play();
    } else {
      this.soundHash[id].playOnLoad = true;
    }
  }
}
