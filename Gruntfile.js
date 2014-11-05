module.exports = function (grunt) {
	
	var config = {
		pkg: grunt.file.readJSON('package.json')
	};


	var loadConfig = function (path) {

		var glob = require('glob');
		var object = {};
		var key;

		glob.sync('*', {cwd: path}).forEach(function(option) {
			key = option.replace(/\.js$/,'');
			object[key] = require(path + option);
		});

		return object;
	};

	grunt.util._.extend(config, loadConfig('./options/'));
	require('load-grunt-tasks')(grunt);
	grunt.initConfig(config);
	grunt.loadTasks('tasks');

	grunt.registerTask('default', ['execute:crawl', 'execute:download', 'ftp:upload']);


}