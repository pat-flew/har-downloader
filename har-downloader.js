var Fs = require('fs');
var Url = require('url');
var Promise = require('bluebird');
var Mkdirp = require('mkdirp');
var Http = require('http');

const REGEX = /\"url": \"([^\"]*)/g;

var harFile = process.argv[2];
var destination = process.argv[3];

getFiles().then(function(files) {
	files = files.filter(function(v, i, a) { return a.indexOf(v) == i });
	return Promise.each(files, function(file, i) {
		console.log((i+1) + '/' + files.length + ' - Downloading: ' + file);
		return downloadFile(file);
	});
});

function getFiles() {
	return new Promise(function(resolve, reject) {
		Fs.readFile(harFile, function(err, data) {
			var capture = data.toString();
			var files = [];
			while (match = REGEX.exec(capture)) {
    			files.push(match[1]);
  			}
			resolve(files);
		});
	});
}

function downloadFile(url, base) {
	return new Promise(function(resolve, reject) {
		var paths = Url.parse(url).pathname.split('/');
		var filename = Url.parse(paths.pop()).pathname;
		paths = paths.join('/');
		Mkdirp(destination + '/' + paths, function(err) {
			file = Fs.createWriteStream(destination + '/' + paths + '/' + filename);
			Http.get({
				host: Url.parse(url).host,
				path: Url.parse(url).pathname,
				post: 80,
			}, function(res) {
				res.on('data', function(data) {
					file.write(data);
				}).on('end', function() {
					file.end();
					resolve();
				}).on('error', function() {
					console.warn('** ERROR');
					file.end();
					reject();
				});
			});
		});
	})
}
