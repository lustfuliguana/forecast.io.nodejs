var util = require('util');
var EventEmitter = require('events').EventEmitter;
var config = require('./../config.json');
var mongodb = require('mongodb');

var MongoDb = function(client) {

	var mongoServer = new mongodb.Server(config.mongo.host, config.mongo.port);
	return new mongodb.Db(config.mongo.database, mongoServer);
};

util.inherits(MongoDb, EventEmitter);
exports.MongoDb = MongoDb;