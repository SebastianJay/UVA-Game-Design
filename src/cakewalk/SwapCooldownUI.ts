"use strict";

import { Sprite } from '../engine/display/Sprite';
import { Vector } from '../engine/util/Vector';
import { IAnimatedSprite, AnimatedSpriteBase } from '../engine/display/AnimatedSprite';
import { applyMixins } from '../engine/util/mixins';

export class SwapCooldownUI extends Sprite implements IAnimatedSprite {
    constructor(id : string, filename : string) {
        super(id, filename);
        this.initAnimation(filename);

    }

    update(dt : number = 0) : void{
    super.update(dt);
    this.updateAnimation();
    }

    animate : (animId: string) => void;
    isPaused : () => boolean;
    setPaused : (b : boolean) => void;
    setGlobalSpeed : (speed: number) => void;
    getGlobalSpeed : () => number;
    protected initAnimation : (filename : string) => void;
    protected updateAnimation : () => void;
}
applyMixins(SwapCooldownUI, [AnimatedSpriteBase]);



