'use strict';

import { DisplayObject } from './DisplayObject';
import { ICollider } from './ColliderSprite';
import { ArrayList } from '../util/ArrayList';

export class DisplayObjectContainer extends DisplayObject {
  private _children : ArrayList<DisplayObject>;
  private static _removeQueue : DisplayObject[] = [];

  constructor(id : string, filename : string) {
    super(id, filename);
    this._children = new ArrayList<DisplayObject>();
  }

  update() : void {
    super.update();
    for (var i = 0; i < this.children.size(); i++) {
      this.children.get(i).update();
    }
  }

  draw(g : CanvasRenderingContext2D) {
    super.draw(g);
    if (this.visible) {
      this.applyTransformations(g);
      for (var i = 0; i < this.children.size(); i++) {
        this.children.get(i).draw(g);
      }
      this.reverseTransformations(g);
    }
  }

  // override to include collisions with all children in display tree
  collidesWith(obj : ICollider) : boolean {
    if (super.collidesWith(obj)) {
      return true;
    }
    for (var i = 0; i < this.children.size(); i++) {
      if (this.children.get(i).collidesWith(obj)) {
        return true;
      }
    }
    return false;
  }

  // Functional programming on the tree
  map(func : (obj : DisplayObject) => void) : void {
    func(this);
    for (var i = 0; i < this.children.size(); i++) {
      if (this.children.get(i) instanceof DisplayObjectContainer) {
        (this.children.get(i) as DisplayObjectContainer).map(func);
      } else {
        func(this.children.get(i)); // apply func but no recursion
      }
    }
  }

  // Children getters and setters
  // Note that the getters are not recursive
  addChild(child : DisplayObject) : DisplayObjectContainer {
    return this.setChild(child, this.children.size());
  }

  setChild(child : DisplayObject, index : number) : DisplayObjectContainer {
    if (index >= 0 && index <= this.children.size()) {
      this.children.set(index, child);
      child.parent = this;
    }
    return this;
  }

  getChild(index: number) : DisplayObject {
    return this.children.get(index);
  }

  getChildById(id : string) : DisplayObject {
    for (var i = 0; i < this.children.size(); i++) {
      if (this.children.get(i).id == id) {
        return this.children.get(i);
      }
    }
    return null;
  }

  containsChild(child : DisplayObject) : boolean {
    return this.children.contains(child);
  }

  // NOTE for the remove methods, these actions are enqueued and do not actually happen
  //  until DisplayObjectContainer.DrainRemoveQueue() is called (from the main game loop).
  //  The reason for this is that Physics calculations may end up having stale/faulty
  //  data about colliders that are no longer in the tree.
  removeChild(child : DisplayObject) : DisplayObjectContainer {
    if (this.containsChild(child)) {
      DisplayObjectContainer._removeQueue.push(child);
    }
    return this;
  }

  removeAtIndex(index : number) : DisplayObjectContainer {
    if (index > 0 && index < this.children.length) {
      DisplayObjectContainer._removeQueue.push(this.children.get(index));
    }
    return this;
  }

  removeSelf() : void {
    if (this.parent != null && this.parent instanceof DisplayObjectContainer) {
      DisplayObjectContainer._removeQueue.push(this);
    }
  }

  clearChildren() : DisplayObjectContainer {
    this._children = new ArrayList<DisplayObject>();
    return this;
  }

  static DrainRemoveQueue() {
    for (var i = 0; i < DisplayObjectContainer._removeQueue.length; i++) {
      var child = DisplayObjectContainer._removeQueue[i];
      (child.parent as DisplayObjectContainer).children.remove(child);
      child.parent = null;
    }
    DisplayObjectContainer._removeQueue = [];
  }

  get children() : ArrayList<DisplayObject> { return this._children; }
}
