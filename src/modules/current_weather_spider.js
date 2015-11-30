var util = require('util');
var EventEmitter = require('events').EventEmitter;
var config = require('./../config.json');
var http = require('https');
var HttpResponseStream = require('./http_response_stream.js').HttpResponseStream;
var SaveMongoRecord = require('./save_mongo_record.js').SaveMongoRecord;
var async = require('async');

var Spider = function(wsServer) {

	this.on('crawl', function(point, forceAll) {
		wsServer.emit('clientsCount', function(clientsCount) {
			if (!forceAll && point != null) {
				async.each([point], crawlPoint);
				return;
			}
			if (!forceAll && clientsCount < 1) {
				console.log('no clients found, skip crawl');
				return;
			}
			console.log('Crawl called');
			var points = [];
			for (var key in config.points) {
				points[points.length] = config.points[key];
			}
			async.each(points, crawlPoint);
		});
	});
	
	var crawlPoint = function(point, force) {
		wsServer.emit('channelClientsCount', point.id, function(count) {
			if (!force && count == 0) {
				console.log('no clients in channel ' + point.id);
				return;
			}
			var httpResponseStream = new HttpResponseStream();
			var saveMongoRecord = new SaveMongoRecord();
			var url = config.source.forecastio.apiUrl + config.source.forecastio.apiKey + '/' + point.coords + '?units=si';
			http.get(url, function(response) {
				httpResponseStream.emit('readAll', response, function(json) {
					json.timestamp = new Date().getTime();
					json.point = point.id;
					saveMongoRecord.emit('save', json, 'currents', function() {
						wsServer.emit('send2all', point.id, json);
						console.log('Crawl updated for ' + point.id);
					});
				});
			}).on('error', function(e) {
				console.log('error ' + e);
			});
		});
	}
	
};

util.inherits(Spider, EventEmitter);
exports.CurrentWeatherSpider = Spider;
