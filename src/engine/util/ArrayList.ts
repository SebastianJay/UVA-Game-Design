'use strict';

/**
 * A very basic arraylist for your convenience
 *
 * */
export class ArrayList<T> {
	contents: T[];

	constructor(){
		this.contents = [];
	}

	/**
	 * add() and push() below both add item to end of the list. Duplicates allowed.
	 */
	add(item : T) : void{
		this.contents.push(item);
	}
	push(item : T) : void{this.add(item);}

	/* Size. Self-explanatory */
	size() : number{
		return this.contents.length;
	}

	/**
	 * Two equivalent methods for getting an item at a specific index
	 */
	itemAt(index : number) : T{
		return this.contents[index];
	}
	get(index : number) : T {return this.itemAt(index);}


	/**
	 * Returns the index of the first instance of item found in the list.
	 * otherwise returns -1
	 */
	indexOf(item : T) : number{
		for	(var i = 0; i < this.contents.length; i++) {
    		if(this.contents[i] == item) return i;
		}
		return -1;
	}

	/* Returns true iff item is in the list somewhere */
	contains(item : T) : boolean {return this.indexOf(item) != -1; }

	/* Set item at a specific index */
	set(index : number, item : T) : void{
		this.contents[index] = item;
	}

	/* Removes ALL instances of the given item */
	remove(item : T) : void{
		var newContents = [];
		for(var i=0; i<this.contents.length; i++){
			if(this.contents[i] != item)
				newContents.push(this.contents[i]);
		}
		this.contents = newContents;
	}

	/**
 	 * remove the element at a specific index
	 */
	removeAt(index : number) : void{
		var newContents = [];
		for(var i=0; i<this.contents.length; i++){
			if(i != index)
				newContents.push(this.contents[i]);
		}
		this.contents = newContents;
	}

	print() : void{
		for(var i=0; i<this.contents.length; i++){
			console.log(this.contents[i] + ", ");
		}
	}
}
