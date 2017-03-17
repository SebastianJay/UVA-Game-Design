"use strict";

import { Vector } from '../util/Vector';
import { Physics } from '../util/Physics';
import { isCollider } from '../util/typecheck';
import { ICollider } from './ColliderSprite';

/**
 * A very basic display object for a javascript based gaming engine
 */
export class DisplayObject {
	private static _objectHash : {[id: string]: DisplayObject} = {};

	private _id : string;
	private _filename : string;	// path to file containing image
	private _loaded : boolean;		// whether the file has been loaded from disk
	private _displayImage : HTMLImageElement;	// the HTML element corresponding to the image
	private _visible : boolean;	// whether the DisplayObject should be drawn
	private _position : Vector;	// 2D position
	private _pivotPoint : Vector;	// origin of the object relative to top-left corner. Ranges from (0, 0) to (1, 1)
	private _localScale : Vector;			// 2D scale vector
	private _rotation : number; 	// amount in degrees to rotate clockwise
	private _alpha : number;		// transparency of object (1.0 = opaque)
	private _parent : DisplayObject;	// reference to this object's parent

	constructor(id : string, filename : string){
		this._id = id;
		this._loaded = false;
		this._filename = filename;
		this.loadImage(filename);

		this.visible = true;
		this.position = new Vector(0, 0);
		this.pivotPoint = new Vector(0, 0);
		this.localScale = new Vector(1.0, 1.0);
		this.rotation = 0.0;
		this.alpha = 1.0;
		this.parent = null;
		DisplayObject._objectHash[id] = this;
	}

	/**
	 * Loads the image, sets a flag called 'loaded' when the image is ready to be drawn
	 */
	loadImage(filename : string) : void{
		if (filename) {
			var t = this;
			this._displayImage = new Image();
			this._displayImage.onload = () => {
				t._loaded = true;
			};
			this._displayImage.src = 'resources/' + filename;
		}
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
		if(this.displayImage && this.visible){
			this.applyTransformations(g);
			if(this._loaded) {
				this.drawImage(g);
			}
			this.reverseTransformations(g);
		}
	}

	/**
	 * Tells whether the given point (screen coordinates) is within the rectangular hitbox of the object/
	 * Used for checking if mouse clicks hit the object -- inter-object collision is handled with collidesWith()
	 */
	isInRect(point: Vector) : boolean {
		// apply inverse forward transform to point
		var test = point.subtract(this.position).divide(this.localScale)
			.rotate(Math.PI * -this.rotation / 180.0).add(this.pivotDistance);
		return test.x > 0 && test.x < this.unscaledWidth && test.y > 0 && test.y < this.unscaledHeight;
	}

	/**
	 * Tells whether this object has collided with the given object. Both object must be colliders to perform check.
	 */
	collidesWith(obj : ICollider) : boolean {
		// first do a typeguard to see if both objects are colliders
		if (!isCollider(this)) {
			return false;
		}
		// next check collisions should occur according to matrix
		if (!Physics.CheckCollisionMat(this.collisionLayer, obj.collisionLayer)) {
			return false;
		}
		// then perform the appropriate hitbox calc
		return Physics.CheckCollisionHitbox(this.getHitbox(), obj.getHitbox());
	}

	/** Helper intended to be overriden by display objects using spritesheets */
	protected drawImage(g: CanvasRenderingContext2D) {
		g.drawImage(this.displayImage,0,0);
	}

	/**
	 * Applies transformations for this display object to the given graphics object
	 * */
	protected applyTransformations(g : CanvasRenderingContext2D) : void {
		if (this.parent) {
			g.translate(this.parent.pivotDistance.x, this.parent.pivotDistance.y);
		}
		g.translate(this.position.x, this.position.y);
		g.scale(this.localScale.x, this.localScale.y);
		g.rotate(Math.PI * this.rotation / 180.0);
		g.translate(-this.pivotDistance.x, -this.pivotDistance.y);
		g.globalAlpha = this.alpha;
	}

	/**
	 * Reverses transformations for this display object to the given graphics object
	 * */
	protected reverseTransformations(g : CanvasRenderingContext2D) : void {
		g.globalAlpha = 1.0;	// set to opaque
		g.translate(this.pivotDistance.x, this.pivotDistance.y);
		g.rotate(Math.PI * -this.rotation / 180.0);
		g.scale(1 / this.localScale.x, 1 / this.localScale.y);
		g.translate(-this.position.x, -this.position.y);
		if (this.parent) {
			g.translate(-this.parent.pivotDistance.x, -this.parent.pivotDistance.y);
		}
	}

	set id(mId : string){this._id = mId;}
	get id() : string{return this._id;}

	set visible(mVisible: boolean){this._visible = mVisible;}
	get visible() : boolean{return this._visible;}

	set position(mPosition: Vector){this._position = mPosition;}
	get position() : Vector{return this._position;}

	set pivotPoint(mPivotPoint : Vector){this._pivotPoint = mPivotPoint;}
	get pivotPoint() : Vector{return this._pivotPoint;}

	set localScale(mLocalScale : Vector){this._localScale = mLocalScale;}
	get localScale() : Vector{return this._localScale;}

	set rotation(mRotation: number){this._rotation = mRotation;}
	get rotation() : number{return this._rotation;}

	set alpha(mAlpha : number){this._alpha = Math.min(Math.max(mAlpha, 0.0), 1.0);}
	get alpha() : number{return this._alpha;}

	set parent(mParent : DisplayObject) { this._parent = mParent; }
	get parent() : DisplayObject{return this._parent;}

	get displayImage() : HTMLImageElement{return this._displayImage;}

	set x(mX : number){this.position.x = mX;}
	get x() : number{return this.position.x;}
	set y(mY : number){this.position.y = mY;}
	get y() : number{return this.position.y;}

	// these protected methods (not getters) are specified so overriding in mixin works properly
	protected getUnscaledWidth() : number { return this.displayImage != null ? this.displayImage.width : 0; }
	protected getUnscaledHeight() : number { return this.displayImage != null ? this.displayImage.height : 0; }
	// these getters are publicly visible
	get unscaledWidth() : number {return this.getUnscaledWidth();}
	get unscaledHeight() : number {return this.getUnscaledHeight();}
	get width() : number{return this.unscaledWidth * this.localScale.x;}
	get height() : number{return this.unscaledHeight * this.localScale.y;}

	private get pivotDistance() : Vector{
		return new Vector(this.pivotPoint.x * this.unscaledWidth, this.pivotPoint.y * this.unscaledHeight);
	}

	static getById(id : string) : DisplayObject {
		return this._objectHash[id];
	}
}
