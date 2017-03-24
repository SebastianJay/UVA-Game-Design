# Game Design Engine

Engine for UVA's Game Design course. Written in Typescript for the browser.

## Installing

There are a few steps to get going with development using this engine.

1. [Download Node.js](https://nodejs.org/en/download/). The important part is NPM. My version of NPM was 4.1.1, but in theory version differences shouldn't matter.
2. Clone this repo, and with a shell pointed at the root directory, run `npm install`. This will install all dependencies needed for development.
3. Run `gulp --lab [number]` to compile Typescript into `/dist/bundle.js`. That appropriate lab code can then be run in browser by opening `index.html`. Some labs that use animation may not work on Chrome (either use Firefox or serve the HTML through localhost).
4. To write new code, download an editor or IDE compatible with Typescript. [Here is a list](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support). I found [Atom](https://atom.io/) with the [Typescript plugin](https://atom.io/packages/atom-typescript) to be sufficient.
