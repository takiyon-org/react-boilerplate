const browserSync = require('browser-sync').create();
const fs = require('fs');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const eslint = require('gulp-eslint');
const replace = require('gulp-replace');
const rev = require('gulp-rev');
const run = require('gulp-run');
const sass = require('gulp-sass');
const scsslint = require('gulp-scss-lint');
const gulpSequence = require('gulp-sequence');
const uglify = require('gulp-uglify');
const revDel = require('rev-del');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const buildConfig = require('./webpack.config.js');

gulp.task('test-script-format', () => (
    gulp.src([
        './app/**/*.js',
        './src/js/**/*.js',
        './*.js',
    ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
));

gulp.task('test-mocha', () => (
    run('npm run test-mocha').exec()
));

gulp.task('test', ['test-script-format', 'test-mocha']);

gulp.task('script-build', () => {
    // Fetch NODE_ENV, which is used to potentially optimize React for production
    buildConfig.plugins.push(new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        },
    }));

    return gulp.src([])
        .pipe(webpackStream(buildConfig, webpack))
        .pipe(gulp.dest('./public/assets/js/'));
});

gulp.task('script-uglify', ['script-build'], () => (
    gulp.src('public/assets/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('public/assets/js'))
));

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

gulp.task('style-uglify', ['style-build'], () => (
    gulp.src('public/assets/css/**/*.css')
        .pipe(cleanCss())
        .pipe(gulp.dest('public/assets/css'))
));

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
gulp.task('html-build', ['revise'], () => {
    const manifest = JSON.parse(fs.readFileSync('public/build/rev-manifest.json', 'utf8'));
    let stream = gulp.src('src/index.html');

    Object.keys(manifest).forEach((key) => {
        stream = stream.pipe(replace(`{{${key}}}`, manifest[key]));
    });

    return stream.pipe(gulp.dest('public'))
        .pipe(browserSync.stream());
});

gulp.task('build', gulpSequence(['script-build', 'style-build'], 'html-build'));
gulp.task('build-prod', gulpSequence(['script-uglify', 'style-uglify'], 'html-build'));
gulp.task('release', gulpSequence('test', 'build'));
gulp.task('release-prod', gulpSequence('apply-prod-environment', 'test', 'build-prod'));

gulp.task('script-watch', (callback) => {
    gulpSequence('script-build', 'html-build')(callback);
});

gulp.task('style-watch', (callback) => {
    gulpSequence('style-build', 'html-build')(callback);
});

gulp.task('dev-server', ['build'], () => {
    browserSync.init({
        ghostMode: false,
        server: './public',
    });

    gulp.watch('src/js/**/*.js', ['script-watch']);
    gulp.watch('src/scss/**/*.scss', ['style-watch']);
    gulp.watch('src/**/*.html', ['html-build']).on('change', browserSync.reload);
});

gulp.task('default', ['release']);
