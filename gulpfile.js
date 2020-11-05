/* ### Gulp  v1.0 ### */

// ### Globals
const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const concat = require('gulp-concat')
const flatten = require('gulp-flatten')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const rename = require('gulp-rename') // renommer le fichier
const sassUnicode = require('gulp-sass-unicode')
const imagemin = require('gulp-imagemin')
const jpegtran = require('imagemin-jpegtran')
const gifsicle = require('imagemin-gifsicle')
const svgo = require('imagemin-svgo')
const optipng = require('imagemin-optipng')
const webp = require('imagemin-webp')
const connect = require('gulp-connect-php')


// ### Config - Paths and other config
var src = {
    sassDir: 'assets/styles/**/*.scss',
    jsDir: 'assets/scripts/**/*.js',
    imgDir: 'assets/images/**/*',
    fontsDir: 'assets/fonts/**/*',
},
build = {
    sassDir: 'dist/styles',
    jsDir: 'dist/scripts',
    imgDir: 'dist/images',
    fontsDir: 'dist/fonts',
},
options = {
    autoprefix: { browsers: ['last 2 versions'] },
},

ProxyUrl = 'http://127.0.0.1:8000'; //local url

// ### SASS

gulp.task('sass', function () {
    return gulp.src(src.sassDir)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sassUnicode())
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(rename('style.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(build.sassDir))
        .pipe(browserSync.stream())
});

// ### JS
gulp.task('js', function () {
    return gulp.src(src.jsDir)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(concat('javascript.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(build.jsDir))
        .pipe(browserSync.stream())
});

// ### Images
gulp.task(
    'images',
    function () {
        return gulp.src(src.imgDir)
            .pipe(
                imagemin(
                    [
                        jpegtran({
                            progressive: true
                        }),
                        gifsicle({
                            interlaced: true
                        }),
                        optipng(),
                        svgo({
                            plugins: [{
                                    removeUnknownsAndDefaults: false
                                },
                                {
                                    cleanupIDs: false
                                }
                            ]
                        })
                    ]
                )
            )
            .pipe(gulp.dest(build.imgDir))
            .pipe(browserSync.stream());
    }
);

// ### Fonts
// `gulp fonts` - Grabs all the fonts and outputs them in a flattened directory
// structure. See: https://github.com/armed/gulp-flatten
gulp.task(
    'fonts',
    function () {
        return gulp.src(src.fontsDir)
            .pipe(flatten())
            .pipe(gulp.dest(build.fontsDir))
            .pipe(browserSync.stream());
    }
);

// ### connect
// `gulp connectPHP`
gulp.task('connectPHP', function() {
    connect.server();
});


// ### watch
// `gulp watch`
// Watch files and reload browser if any change
gulp.task('watch', function () {
    connect.server();
    browserSync.init({
        files: ['**/*.php', '*.php', '*.html'], // watching files
        proxy: ProxyUrl,
        browser: "google chrome"
    });

    gulp.watch([src.sassDir], gulp.series('sass'));
    gulp.watch([src.jsDir], gulp.series('js'));
    gulp.watch([src.fontsDir], gulp.series('fonts'));
    gulp.watch([src.imgDir], gulp.series('images'));

})

// ### Clean
// `gulp clean`
// Deletes the build folder entirely.
gulp.task('clean', require('del').bind(null, ['dist']));

// ### Build
// `gulp build`
gulp.task(
    'build',
    gulp.series(
        'sass',
        'js',
        gulp.parallel('fonts', 'images')
    )
);

// ### Gulp
// `gulp`
// clean and build.
gulp.task('default', gulp.series('clean', 'build'));
