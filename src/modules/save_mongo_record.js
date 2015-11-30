var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MongoDb = require('./mongo_db.js').MongoDb;

var SaveMongoRecord = function() {

	this.on('save', function(json, table, callback){
		var db = new MongoDb();
		db.open(function(err, con) {
			var currents = con.collection(table);
			if (err !=  null) {
				console.log(err);
				return;
			}
			else {
				currents.insert(json);
			}
			con.close();
			callback();
		});
	});
	
};

util.inherits(SaveMongoRecord, EventEmitter);
exports.SaveMongoRecord = SaveMongoRecord;