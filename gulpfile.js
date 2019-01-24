const browserSync = require('browser-sync').create();
const { exec } = require('child_process');
const fs = require('fs');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const eslint = require('gulp-eslint');
const replace = require('gulp-replace');
const rev = require('gulp-rev');
const sass = require('gulp-sass');
const scsslint = require('gulp-scss-lint');
const uglify = require('gulp-uglify');
const revDel = require('rev-del');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const buildConfig = require('./webpack.config.js');

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

/* eslint-disable no-console */
gulp.task('test-mocha', (callback) => {
    exec('npm run test-mocha', (error, stdout, stderr) => {
        console.log(stdout);

        if (stderr !== '') {
            console.error(stderr);
        }

        callback(error);
    });
});
/* eslint-enable no-console */

gulp.task('test', gulp.series('test-script-format', 'test-mocha'));

gulp.task('script-build', () => {
    // Fetch NODE_ENV, which is used to potentially optimize React for production
    buildConfig.plugins.push(new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        },
    }));

    return gulp.src(['./src/js/entry.js'])
        .pipe(webpackStream(buildConfig, webpack))
        .pipe(gulp.dest('./public/assets/js/'));
});

gulp.task('script-uglify', gulp.series('script-build', () => (
    gulp.src('public/assets/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('public/assets/js'))
)));

gulp.task('style-build', () => (
    gulp.src('src/scss/**/*.scss')
        .pipe(scsslint())
        .pipe(scsslint.failReporter())
        .pipe(sass({
            outputStyle: 'expanded',
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
        }))
        .pipe(gulp.dest('./public/assets/css'))
));

gulp.task('style-uglify', gulp.series('style-build', () => (
    gulp.src('public/assets/css/**/*.css')
        .pipe(cleanCss())
        .pipe(gulp.dest('public/assets/css'))
)));

// Mark a build for production such that React can make optimizations
gulp.task('apply-prod-environment', () => {
    process.env.NODE_ENV = 'production';

    return true;
});

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
gulp.task('html-build', gulp.series('revise', () => {
    const manifest = JSON.parse(fs.readFileSync('public/build/rev-manifest.json', 'utf8'));
    let stream = gulp.src('src/index.html');

    Object.keys(manifest).forEach((key) => {
        stream = stream.pipe(replace(`{{${key}}}`, manifest[key]));
    });

    return stream.pipe(gulp.dest('public'))
        .pipe(browserSync.stream());
}));

gulp.task('build', gulp.series(gulp.parallel('script-build', 'style-build'), 'html-build'));
gulp.task('build-prod', gulp.series(gulp.parallel('script-uglify', 'style-uglify'), 'html-build'));
gulp.task('release', gulp.series('test', 'build'));
gulp.task('release-prod', gulp.series('apply-prod-environment', 'test', 'build-prod'));

gulp.task('script-watch', gulp.series('script-build', 'html-build'));
gulp.task('style-watch', gulp.series('style-build', 'html-build'));

gulp.task('dev-server', gulp.series('build', () => {
    browserSync.init({
        ghostMode: false,
        server: './public',
    });

    gulp.watch('src/js/**/*.js').on('change', gulp.series('script-watch'));
    gulp.watch('src/scss/**/*.scss').on('change', gulp.series('style-watch'));
    gulp.watch('src/**/*.html').on('change', gulp.series('html-build', browserSync.reload));
}));

gulp.task('default', gulp.series('release'));
