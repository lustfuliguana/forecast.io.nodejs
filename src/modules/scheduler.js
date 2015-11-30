var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Scheduler = function(job, cfg) {

	if (!cfg.on) {
		return;
	}
	
	var timeout = null;
	
	var schedule = function() {
		job.emit(cfg.event);
		timeout = setTimeout(schedule, cfg.interval);
	};
	
	timeout = setTimeout(schedule, 20000);
};

util.inherits(Scheduler, EventEmitter);
exports.Scheduler = Scheduler;
