"use strict";

import { DisplayObject } from './DisplayObject';

/**
 * A very basic Sprite. For now, does not do anything.
 */
export class Sprite extends DisplayObject{

	constructor(id : string, filename : string){
		super(id, filename);
	}

	/**
	 * Invoked every frame, manually for now, but later automatically if this DO is in DisplayTree
	 */
	update(){

	}

	/**
	 * Draws this image to the screen
	 */
	draw(g){
		super.draw(g);
	}
}
