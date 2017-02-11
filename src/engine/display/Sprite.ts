"use strict";

import { DisplayObjectContainer } from './DisplayObjectContainer';

/**
 * A very basic Sprite. For now, does not do anything.
 */
export class Sprite extends DisplayObjectContainer {

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
	draw(g : CanvasRenderingContext2D){
		super.draw(g);
	}
}
