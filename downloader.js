var Fs = require('fs');
var Url = require('url');
var Promise = require('bluebird');
var Mkdirp = require('mkdirp');
var Http = require('http');

const BASE_URL = 'http://www.change-pain.co.uk/static_media/modules/module-5/';
const FILES_PATH = './files.txt';
const DESTINATION = 'download';

getFiles().then(function(files) {
	files = files.filter(function(v, i, a) { return a.indexOf(v) == i });
	return Promise.each(files, function(file, i) {
		console.log(i + '/' + files.length + ' - Downloading: ' + file);
		return downloadFile(file);
	});
});

function getFiles() {
	return new Promise(function(resolve, reject) {
		Fs.readFile(FILES_PATH, function(err, data) {
			var files = data.toString().split('\n');
			resolve(files);
		});
	});
}

function downloadFile(url) {
	return new Promise(function(resolve, reject) {
		var paths = url.substring(BASE_URL.length).split('/');
		var filename = Url.parse(paths.pop()).pathname;
		paths = paths.join('/');
		Mkdirp(DESTINATION + '/' + paths, function(err) {
			file = Fs.createWriteStream(DESTINATION + '/' + paths + '/' + filename);
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
					reject();
				});
			});
		});
	})
}
