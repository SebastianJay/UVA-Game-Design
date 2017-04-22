import { DisplayObject } from './DisplayObject';
import { DisplayObjectContainer } from './DisplayObjectContainer';
import { Vector } from '../util/Vector';

/**
 * A container class that detects how big an image is on load and then
 * creates objects tiled in the X-direction to fit desired dimensions.
 * NOTE if the target width and height do not work out evenly with respect to
 *  image dimensions, then the last object created may span extra width
 */
export class TiledSpriteContainer extends DisplayObjectContainer {
  constructor(id : string, filename : string,
    private _targetWidth : number,
    private _targetHeight : number,
    private _factoryMethod: (id:string, filename:string) => DisplayObject) {
    super(id, filename);
  }

  /** Override image loaded handler to create new tiled objects of similar proportion */
  protected onDisplayImageLoaded() : void {
    super.onDisplayImageLoaded();
    var imgWidth = this.displayImage.width;
    var imgHeight = this.displayImage.height;
    var scaleRatio = this._targetHeight / imgHeight;
    var numTiles = this._targetWidth / (imgWidth * scaleRatio);

    // this object now becomes a container for others
    this.localScale = Vector.one;
    for (var i = 0; i < numTiles; i++) {
      this.addChild(c = this._factoryMethod(this.id + '_' + i, this.filename));
      var c;
      c.position.x = i * (imgWidth * scaleRatio);
      c.localScale = new Vector(scaleRatio, scaleRatio);
    }
    this.displayImage.src = ''; // get rid of image in parent
  }
}
