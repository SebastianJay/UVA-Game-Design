var gulp = require("gulp");
var yargs = require("yargs");

var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
if ('uglify' in yargs.argv) {
    var uglify = require("gulp-uglify");
    var sourcemaps = require("gulp-sourcemaps");
    var buffer = require("vinyl-buffer");
}

var wordMappings = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

gulp.task("default", function () {
    var bundle = browserify({
        basedir: '.',
        debug: true,
        entries: ('lab' in yargs.argv) ? ['src/labs/Lab' + wordMappings[yargs.argv.lab] + 'Game.ts'] : ['src/cakewalk/MainGame.ts']
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'));

    if ('uglify' in yargs.argv) {
        bundle = bundle.pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'));
    }

    return bundle.pipe(gulp.dest("dist"));
});
