"use strict";

import { DisplayObjectContainer } from './DisplayObjectContainer';

/**
 * A very basic Sprite. For now, does not do anything.
 */
export class Sprite extends DisplayObjectContainer {
	constructor(id : string, filename : string){
		super(id, filename);
	}
}
