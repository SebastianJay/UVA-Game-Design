var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
var yargs = require("yargs");
var wordMappings = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

gulp.task("default", function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ('lab' in yargs.argv) ? ['src/labs/Lab' + wordMappings[yargs.argv.lab] + 'Game.ts'] : ['src/cakewalk/MainGame.ts']
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest("dist"));
});
