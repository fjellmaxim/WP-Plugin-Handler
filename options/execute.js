module.exports = {

	crawl: {

		call: function (grunt, options, async) {

			var libs = {
				request: require('request'),
				cheerio: require('cheerio')
			};


			var internals = {
				done: async(),
				plugins: grunt.file.readJSON('plugins.json'),
				isDone: function () {
					return internals.inProgress === 0;
				},
				inProgress: 0,
				data: {}
			};


			try {
				internals.data = grunt.file.readJSON('data.json')
			} catch (e) {
				internals.data = {};
			}

			grunt.util._.each(internals.plugins, function (plugin) {
				internals.inProgress++;

				var URL = 'http://wordpress.org/plugins/' + plugin;

				var processResponse = function (error, response, body) {
					internals.inProgress--;
					
					var $ = libs.cheerio.load(body);
					var link = $('a[itemprop="downloadUrl"]');

					var pluginData = {
						name: plugin,
						url: link.attr('href').replace('https', 'http'),
						version: link.text().replace('Download Version ', '')
					};

					internals.data[plugin] = pluginData;

					console.log('Downloaded', plugin, 'data, version:', pluginData.version);

					if(internals.isDone()) {

						grunt.file.write('data.json', JSON.stringify(internals.data));

						internals.done();
					}
				}

				console.log('Starting data download for', plugin);
				libs.request(URL, processResponse);

			});

		}

	},

	download: {

		call: function (grunt, options, async) {

			var libs = {
				fs: require('fs'),
				http: require('http')
			};

			var internals = {
				done: async(),
				isDone: function () {
					return internals.inProgress === 0;
				},
				data: grunt.file.readJSON('data.json'),
				targetFolder: 'downloads/',
				inProgress: 0
			};
			grunt.file.mkdir(internals.targetFolder);
			grunt.util._.each(internals.data, function (plugin) {
				
				internals.inProgress++;
				var filename = plugin.name + '.zip';
				var file = libs.fs.createWriteStream(internals.targetFolder+filename);


				console.log('Downloading', plugin.name, 'zip archive');
				var request = libs.http.get(plugin.url, function (response) {
					response.pipe(file);

					file.on('finish', function () {
						
						internals.inProgress--;
						
						console.log('Downloaded', plugin.name, 'zip file successfully');
						
						if(internals.isDone()) {

							internals.done();
						}

					});

				});

			});
		}

	},

	upload: {

		call: function (grunt, options, async) {

			var libs = {

			};

			var internals = {
				done: async(),
				isDone: function () {
					return internals.inProgress === 0;
				},
				inProgress:0
			};

			grunt.task.run('ftp');


		}

	}

};