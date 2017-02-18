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
        entries: ['src/labs/Lab' + (('lab' in yargs.argv) ? wordMappings[yargs.argv.lab] : wordMappings[1]) + 'Game.ts'],
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest("dist"));
});
