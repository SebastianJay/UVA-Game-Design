'use strict';

import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { TiledSpriteContainer } from '../engine/display/TiledSpriteContainer';
import { Sprite } from '../engine/display/Sprite';
import { Vector } from '../engine/util/Vector';
import { CameraScrollEventArgs } from '../engine/events/EventTypes';


/**
 * Contains logic to randomly create background layers and have parallaxed movement as camera moves.
 */
export class BGLayerContainer extends DisplayObjectContainer {
  private static LayerAssets = [
    'CakeWalk/wave_blue.png',
    'CakeWalk/wave_red.png',
    'CakeWalk/wave_orange.png',
    'CakeWalk/wave_yellow.png',
    'CakeWalk/wave_purple.png',
  ];

  private _staticlayer : Sprite;
  private _layers : DisplayObjectContainer[];

  constructor(id : string, width : number, height : number) {
    super(id, '');
    // create all possible layers at start
    this._staticlayer = new Sprite(this.id+'_staticlayer', 'CakeWalk/staticbg.png');
    this._layers = [];
    for (var i = 0; i < BGLayerContainer.LayerAssets.length; i++) {
      this._layers.push(
        new TiledSpriteContainer(this.id+'_layer'+i, BGLayerContainer.LayerAssets[i], width, height,
          (id:string, filename:string) => {
            return new Sprite(id, filename);
          },
          3.0
        )
      );
    }
  }

  get handleCameraScroll() {
    var self = this;
    return (args : CameraScrollEventArgs) => {
      if (self.children.length >= 4) {
        self.getChild(0).position = self.getChild(0).position.subtract(args.dp);  // keep in same place on screen
        self.getChild(1).position = self.getChild(1).position.add(args.dp.multiply(0.45));
        self.getChild(2).position = self.getChild(2).position.add(args.dp.multiply(0.3));
        self.getChild(3).position = self.getChild(3).position.add(args.dp.multiply(0.15));
      }
    };
  }

  reset() : void {
    // pick three different layers randomly
    var indices = [];
    for (var i = 0; i < this._layers.length; i++) { indices.push(i); }
    var ind0 = Math.floor(Math.random() * indices.length);
    var child0 = this._layers[indices[ind0]];
    indices.splice(ind0, 1);
    var ind1 = Math.floor(Math.random() * indices.length);
    var child1 = this._layers[indices[ind1]];
    indices.splice(ind1, 1);
    var ind2 = Math.floor(Math.random() * indices.length);
    var child2 = this._layers[indices[ind2]];
    indices.splice(ind2, 1);

    // set layers as children with right positions and scales
    // NOTE some magic numbers specific to the game are used here
    this._staticlayer.position = new Vector(0, 0);
    child0.position = new Vector(0, 120);
    child0.localScale = new Vector(0.6, 0.6);
    child1.position = new Vector(0, 150);
    child1.localScale = new Vector(0.8, 0.8);
    child2.position = new Vector(0, 180);
    child2.localScale = new Vector(1, 1);
    this.clearChildren();
    this.addChild(this._staticlayer);
    this.addChild(child0);
    this.addChild(child1);
    this.addChild(child2);
  }
}
