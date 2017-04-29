'use strict';

import { DisplayObjectContainer } from '../engine/display/DisplayObjectContainer';
import { TiledSpriteContainer } from '../engine/display/TiledSpriteContainer';
import { Sprite } from '../engine/display/Sprite';
import { Vector } from '../engine/util/Vector';

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

  private _layers : DisplayObjectContainer[];

  constructor(id : string, width : number, height : number) {
    super(id, '');
    // create all possible layers at start
    this._layers = [];
    for (var i = 0; i < BGLayerContainer.LayerAssets.length; i++) {
      this._layers.push(
        new TiledSpriteContainer(this.id+'_layer'+i, BGLayerContainer.LayerAssets[i], width, height,
          (id:string, filename:string) => {
            return new Sprite(id, filename);
          })
      );
    }
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

    // set three layers as children with right positions and scales
    // NOTE some magic numbers specific to the game are used here
    child0.position = new Vector(0, 120);
    child0.localScale = new Vector(0.6, 0.6);
    child1.position = new Vector(0, 150);
    child1.localScale = new Vector(0.8, 0.8);
    child2.position = new Vector(0, 180);
    child2.localScale = new Vector(1, 1);
    this.clearChildren();
    this.addChild(child0);
    this.addChild(child1);
    this.addChild(child2);
  }
}
