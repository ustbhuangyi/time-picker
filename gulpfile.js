var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var inline = require('gulp-inline-js');
var webpack = require('gulp-webpack');

var dest = 'dist';

var path = {
	lib: 'src/lib/**/*.js',
	js: 'src/timepicker/*.js',
	css: 'src/**/*.css',
	html: 'src/**/*.html'
};

var webpackConf = {
	entry: './src/timepicker/timepicker',
	output: {
		path: __dirname + '/' + dest,
		filename: "timepicker.js"
	}
};

gulp.task('clean', require('del').bind(null, [dest]));

gulp.task('lib', function () {

	return gulp.src(path.lib)
		.pipe(inline())
		.pipe(gulp.dest(dest + '/lib'));
});

gulp.task('script', function () {

	return gulp.src(path.js)
		.pipe(inline())
		.pipe(webpack(webpackConf))
		.pipe(gulp.dest(dest + '/timepicker'));
});

gulp.task('css', function () {

	return gulp.src(path.css)
		.pipe(gulp.dest(dest));
});

gulp.task('html', function () {

	return gulp.src(path.html)
		.pipe(gulp.dest(dest));

});

gulp.task('connect', ['compile'], function () {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: [dest]
		}
	});

	// watch for changes
	gulp.watch(path.js, function () {
		gulp.start('script');
		reload();
	});
	gulp.watch(path.css, function () {
		gulp.start('css');
		reload();
	});
	gulp.watch(path.html, function () {
		gulp.start('html');
		reload();
	});
});

gulp.task('compile', ['lib', 'script', 'css', 'html']);

gulp.task('default', ['clean'], function () {

	gulp.start('compile');
});

gulp.task('serve', ['clean'], function () {
	gulp.start('connect');
});