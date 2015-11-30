var util = require('util');
var EventEmitter = require('events').EventEmitter;
var WebSocketServer = require('ws').Server;
var WsSendCurrent = require('./ws_send_current.js').WsSendCurrent;
var url = require('url');
var config = require('./../config.json');
var CurrentWeatherSpider = require('./current_weather_spider.js').CurrentWeatherSpider;

var WsServer = function() {
	
	var self = this;
	var options = {
			port: config.wsServer.port,
			host: config.wsServer.addr
	};
	var wss = new WebSocketServer(options);
	console.log('Started WebSocket server ws://' + options.host + ':' + options.port);
	
	wss.on('connection', function connection(client) {
		console.log('New websocket client from ' + client.upgradeReq.connection.remoteAddress);
		client = createClientChannelsCfg(client);
		
		client.on('message', function incoming(msg) {
			var json = JSON.parse(msg);
			console.log('Received from ' + client.upgradeReq.connection.remoteAddress + ': ' + msg);
			if (json.cmd == 'add_channel') {
				addChannel(client, json);
				sendCurrentInfo(client);
			}
			else if (json.cmd == 'rem_channel') {
				remChannel(client, json)
			}
			else if (json.cmd == 'points_list') {
				sendPointsList(client);
			}
		});
		
		sendPointsList(client);
		sendCurrentInfo(client);
	});
	
	var sendPointsList = function(client) {
		var points = {};
		for (var key in config.points) {
			if (config.points[key].private === true && client.lt === false) {
				continue;
			}
			points[key] = {id: key, name: config.points[key].name};
		}
		client.send(JSON.stringify({msg_type: 'points_list', val: points}), function(err) {
			if (err != null) {
				console.log(err);
			}
		});
	};
	
	var sendCurrentInfo = function(client) {
		var wsSendCurrent = new WsSendCurrent();
		wsSendCurrent.emit('send', client, function(json) {
			if (json != null && json.timestamp != null 
					&& json.timestamp + config.currentWeatherSpider.interval >= new Date().getTime()) {
				return;
			}
			if (json == null) {
				return;
			}
			var currentWeatherSpider = new CurrentWeatherSpider(self);
			currentWeatherSpider.emit('crawl', config.points[json.point], false);
		});
	};
	
	var addChannel = function(client, json) {
		client.channels[json.point] = true
	};
	
	var remChannel = function(client, json) {
		client.channels[json.point] = false;
	};
	
	var createClientChannelsCfg = function(client) {
		client.channels = {};
		var parsedUrl = url.parse(client.upgradeReq.url, true);
		if (parsedUrl.query.defaultPoint != null && config.points[parsedUrl.query.defaultPoint] != null) {
			client.channels[parsedUrl.query.defaultPoint] = true;
		}
		else {
			client.channels[config.points.lypnyky.id] = true;
		}
		if (parsedUrl.query.lt != null && parsedUrl.query.lt === 'keyy') {
			client.lt = true;
		}
		else {
			client.lt = false;
		}
		
		return client;
	};
	
	this.on('send2all', function(channel, json) {
		console.log('send2All called for channel='+channel);
		wss.clients.forEach(function each(client) {
			var tmp = client.channels[channel];
			if (tmp == null || tmp !== true) {
				return;
			}
			client.send(JSON.stringify({
				msg_type: 'current',
				val: json
			}), function(err) {
				if (err != null) {
					condole.log(err);
				}
			});
		});
	});
	
	this.on('clientsCount', function(callback) {
		callback(wss.clients.length);
	});
	
	this.on('channelClientsCount', function(channel, callback) {
		var count = 0;
		wss.clients.forEach(function each(client) {
			var tmp = client.channels[channel];
			if (tmp == null || tmp !== true) {
				return;
			}
			count = count + 1;
		});
		callback(count);
	});
};

util.inherits(WsServer, EventEmitter);
exports.WsServer = WsServer;