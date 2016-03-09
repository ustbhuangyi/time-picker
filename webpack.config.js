var path = require('path');

//var version = require('./package.json').version;

module.exports = {
	entry: {
		timepicker: './src/timepicker/timepicker.js'
	},
	output: {
		path: __dirname + '/build',
		filename: '[name].js'
	},
	resolveLoader: {
		root: path.join(__dirname, 'node_modules')
	}
};