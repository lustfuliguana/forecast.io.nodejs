var CurrentWeatherSpider = require('./modules/current_weather_spider.js').CurrentWeatherSpider;
var Scheduler = require('./modules/scheduler.js').Scheduler;
var WsServer = require('./modules/ws_server.js').WsServer;
var config = require('./config.json');

var wsServer = new WsServer();
var currentWeatherSpider = new CurrentWeatherSpider(wsServer);
var currentWeatherSpiderScheduler = new Scheduler(currentWeatherSpider, config.currentWeatherSpider);
currentWeatherSpider.emit('crawl', null, true);

console.log('Ready');