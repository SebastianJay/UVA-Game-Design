"use strict";

/**
 * A very basic display object for a javascript based gaming engine
 *
 * */
export class DisplayObject{

	id : string;
	filename : string;
	loaded : boolean;
	displayImage : HTMLImageElement;

	constructor(id : string, filename : string){
		this.id = id;
		this.loaded = false;
		this.loadImage(filename);
	}

	/**
	 * Loads the image, sets a flag called 'loaded' when the image is ready to be drawn
	 */
	loadImage(filename : string) : void{
		var t = this;
		this.displayImage = new Image();
  		this.displayImage.onload = () => {
  			t.loaded = true;
  		};
  		this.displayImage.src = 'resources/' + filename;
	}

	/**
	 * Invoked every frame, manually for now, but later automatically if this DO is in DisplayTree
	 */
	update() : void{

	}

	/**
	 * Draws this image to the screen
	 */
	draw(g : CanvasRenderingContext2D){
		if(this.displayImage){
			this.applyTransformations(g);
			if(this.loaded) g.drawImage(this.displayImage,0,0);
			this.reverseTransformations(g);
		}
	}

	/**
	 * Applies transformations for this display object to the given graphics
	 * object
	 * */
	applyTransformations(g : CanvasRenderingContext2D) {

	}

	/**
	 * Reverses transformations for this display object to the given graphics
	 * object
	 * */
	reverseTransformations(g : CanvasRenderingContext2D) {

	}

	/**
	 * GETTERS AND SETTERS
	 */

	setId(id : string){this.id = id;}
	getId() : string{return this.id;}

	setDisplayImage(image : HTMLImageElement){this.displayImage = image;} //image needs to already be loaded!
	getDisplayImage() : HTMLImageElement{return this.displayImage;}

	getUnscaledHeight() : number {return this.displayImage.height;}
	getUnscaledWidth() : number {return this.displayImage.width;}
}
