var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MongoDb = require('./mongo_db.js').MongoDb;
var async = require('async');

var WsSendCurrent = function() {

	var db = new MongoDb();
	var client = null;
	var callback = callback;
	
	this.on('send', function(cclient, ccallback) {
		var keys = [];
		client = cclient;
		callback = ccallback;
		for (key in cclient.channels) {
			if (cclient.channels[key] !== true) {
				continue;
			}
			keys[keys.length] = key;
		}
		async.each(keys, sendCurrent);
	});
	
	var sendCurrent = function(key) {
		db.open(function(err, con) {
			if (err != null) {
				console.log(err);
				try {
					con.close();
				}
				catch (e) {
					console.log('db error ' + e);
				}
			}
			else {
				var currents = con.collection('currents');
				currents.find({point: key}).sort({timestamp: -1}).limit(1)
					.toArray(function(err, record) {
						if (record == null || record.length == 0) {
							return;
						}
						client.send(JSON.stringify({
							msg_type: 'current',
							val: record[0]
						}), function(err) {
							if (err != null) {
								console.log(err);
							}
						});
						con.close();
						callback(record[0]);
					});
			}
		});
	};
};

util.inherits(WsSendCurrent, EventEmitter);
exports.WsSendCurrent = WsSendCurrent;
