const browserSyncImport = require('browser-sync');
const exec = require('gulp-exec');
const fs = require('node:fs');
const gulp = require('gulp');
const replace = require('gulp-replace');
const rev = require('gulp-rev');
const revDel = require('rev-del');
const yargs = require('yargs');

// Can either set stage in environment variable, command line, or default to local
const { argv } = yargs.default({
    stage: process.env.STAGE || 'local',
});

const browserSync = browserSyncImport.create();

// Mark a build for production
gulp.task('apply-dev-environment', (callback) => {
    process.env.NODE_ENV = 'development';
    callback();
});

// Mark a build for production
gulp.task('apply-prod-environment', (callback) => {
    process.env.NODE_ENV = 'production';
    callback();
});

gulp.task('test-script-format', () => (
    gulp.src('./gulpfile.js')
        .pipe(exec('npm run test-script-format'))
        .pipe(exec.reporter())
));

gulp.task('test-script-mocha', () => (
    gulp.src('./gulpfile.js')
        .pipe(exec('npm run test-script-mocha'))
        .pipe(exec.reporter())
));

gulp.task('test-script', gulp.series(gulp.parallel('test-script-format', 'test-script-mocha')));

gulp.task('build-script', () => (
    gulp.src('./gulpfile.js')
        .pipe(exec('npm run build-script'))
        .pipe(exec.reporter())
));

gulp.task('test-style-format', () => (
    gulp.src('./gulpfile.js')
        .pipe(exec('npm run test-style'))
        .pipe(exec.reporter())
));

gulp.task('build-style', () => (
    gulp.src('./gulpfile.js')
        .pipe(exec('npm run build-style'))
        .pipe(exec.reporter())
));

gulp.task('minify-style', gulp.series('build-style', () => (
    gulp.src('./gulpfile.js')
        .pipe(exec('npm run minify-style'))
        .pipe(exec.reporter())
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

// Build asset references from new revision manifest
// Allows cache-busting of client assets
gulp.task('build-html', gulp.series('revise', () => {
    const manifest = JSON.parse(fs.readFileSync('public/build/rev-manifest.json', 'utf8'));
    const env = JSON.parse(fs.readFileSync(`public/env.${argv.stage}.json`, 'utf8'));
    let stream = gulp.src('src/index.html');

    // Insert asset paths
    Object.keys(manifest).forEach((key) => {
        stream = stream.pipe(replace(`{{${key}}}`, manifest[key]));
    });

    // Insert environment variables
    stream = stream.pipe(replace('"{{env}}"', JSON.stringify(env)));

    // Emit final file
    return stream.pipe(gulp.dest('public')).pipe(browserSync.stream());
}));

gulp.task('build', gulp.series('apply-dev-environment', gulp.parallel('build-script', 'build-style'), 'build-html'));
gulp.task('build-prod', gulp.series('apply-prod-environment', gulp.parallel('build-script', 'minify-style'), 'build-html'));
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
