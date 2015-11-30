var util = require('util');
var EventEmitter = require('events').EventEmitter;

var HttpResponseStream = function(currentWeatherSpider) {

	this.on('readAll', function(response, callback){
		var str = '';
		response.on('data', function (chunk) {
			str += chunk;
		});
		response.on('end', function () {
			try {
				callback(JSON.parse(str));
			}
			catch(e) {
				console.log(e);
			}
		});
	});
	
};

util.inherits(HttpResponseStream, EventEmitter);
exports.HttpResponseStream = HttpResponseStream;
