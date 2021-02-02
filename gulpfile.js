const autoprefixer = require('gulp-autoprefixer');
const browserSyncImport = require('browser-sync');
const cleanCss = require('gulp-clean-css');
const eslint = require('gulp-eslint');
const fs = require('fs');
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const replace = require('gulp-replace');
const rev = require('gulp-rev');
const sass = require('gulp-dart-sass');
const styleLint = require('gulp-stylelint');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const uglify = require('gulp-uglify');
const revDel = require('rev-del');
const yargs = require('yargs');

const buildConfig = require('./webpack.config.js');

// Can either set stage in environment variable, command line, or default to local
const { argv } = yargs.default({
    stage: process.env.STAGE || 'local',
});

const browserSync = browserSyncImport.create();

// Mark a build for production
gulp.task('apply-prod-environment', (callback) => {
    process.env.NODE_ENV = 'production';
    callback();
});

gulp.task('test-script-format', () => (
    gulp.src([
        './app/**/*.js',
        './src/js/**/*.js',
        './test/**/*.js',
        './*.js',
    ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
));

gulp.task('test-script-mocha', () => (
    gulp.src(['./test/**/*.js'])
        .pipe(mocha({
            require: [
                '@babel/register',
                './test/setup.js',
            ],
        }))
));

gulp.task('test-script', gulp.series(gulp.parallel('test-script-format', 'test-script-mocha')));

gulp.task('build-script', () => {
    const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

    return gulp.src(['./src/js/entry.js'])
        .pipe(webpackStream({ ...buildConfig, mode }, webpack))
        .pipe(gulp.dest('./public/assets/js/'));
});

gulp.task('uglify-script', gulp.series('build-script', () => (
    gulp.src('public/assets/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('public/assets/js'))
)));

gulp.task('test-style-format', () => (
    gulp.src('src/scss/**/*.scss')
        .pipe(styleLint({
            reporters: [
                { formatter: 'string', console: true },
            ],
        }))
));

gulp.task('build-style', () => (
    gulp.src('src/scss/**/*.scss')
        .pipe(sass({
            outputStyle: 'expanded',
        }))
        .pipe(autoprefixer())
        .pipe(gulp.dest('./public/assets/css'))
));

gulp.task('uglify-style', gulp.series('build-style', () => (
    gulp.src('public/assets/css/**/*.css')
        .pipe(cleanCss())
        .pipe(gulp.dest('public/assets/css'))
)));

gulp.task('test', gulp.series(gulp.parallel('test-script', 'test-style-format')));

gulp.task('revise', () => (
    gulp.src('public/assets/**/*.*')
        .pipe(gulp.dest('public/build'))
        .pipe(rev())
        .pipe(gulp.dest('public/build'))
        .pipe(rev.manifest())
        .pipe(revDel({ dest: 'public/build' }))
        .pipe(gulp.dest('public/build'))
));

// Build HTML file from new revision manifest
// Allows cache-busting of client assets
gulp.task('build-html', gulp.series('revise', () => {
    const manifest = JSON.parse(fs.readFileSync('public/build/rev-manifest.json', 'utf8'));
    const env = JSON.parse(fs.readFileSync(`public/env.${argv.stage}.json`, 'utf8'));
    let stream = gulp.src('src/index.html');

    Object.keys(manifest).forEach((key) => {
        stream = stream.pipe(replace(`{{${key}}}`, manifest[key]));
    });

    stream = stream.pipe(replace('"{{env}}"', JSON.stringify(env)));

    return stream.pipe(gulp.dest('public'))
        .pipe(browserSync.stream());
}));

gulp.task('build', gulp.series(gulp.parallel('build-script', 'build-style'), 'build-html'));
gulp.task('build-prod', gulp.series('apply-prod-environment', gulp.parallel('uglify-script', 'uglify-style'), 'build-html'));
gulp.task('release', gulp.series('test', 'build'));
gulp.task('release-prod', gulp.series('test', 'build-prod'));

gulp.task('watch-script', gulp.series('build-script', 'build-html'));
gulp.task('watch-style', gulp.series('build-style', 'build-html'));

gulp.task('dev-server', gulp.series('build', () => {
    browserSync.init({
        ghostMode: false,
        server: './public',
    });

    gulp.watch('src/js/**/*.js').on('change', gulp.series('watch-script'));
    gulp.watch('src/scss/**/*.scss').on('change', gulp.series('watch-style'));
    gulp.watch('src/**/*.html').on('change', gulp.series('build-html', browserSync.reload));
}));

gulp.task('default', gulp.series('release'));
