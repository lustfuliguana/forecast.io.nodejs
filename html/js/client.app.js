var com = com || {};
com.lypnyky = com.lypnyky || {};
com.lypnyky.meteo = com.lypnyky.meteo || {};

com.lypnyky.meteo.ClientApp = function() {
	
	var ws = null;
	var timeout = 1000;
	var points = {};
	var point = 'lypnyky';
	var lt = '';
	
	var connectWs = function() {
		ws = new WebSocket('ws://' + document.location.hostname + ':9509/?lt='+lt);
		ws.onopen = function(e) { 
			timeout = 1000;
		};
		ws.onclose = function(e) { reconnect(); };
		ws.onmessage = function(e) {
			var json = JSON.parse(e.data);
			if (json.msg_type == 'current') {
				showWeather(json.val);
			}
			else if (json.msg_type == 'points_list') {
				showPointsList(json.val);
			}
		};
		ws.onerror = function(e) { console.log(e); };
	};
	
	var showPointsList = function(pointsList) {
		points = pointsList;
		var html = '<ul>';
		for (key in points) {
			html = html + '<li><a href="javascript: clientApp.changeChannel(\'' + key + '\');">' + points[key].name + '</a></li>'
		}
		html = html + '</ul>';
		jQuery('#points').html(html);
	};
	
	var reconnect = function() {
		timeout = timeout+timeout;
		if (timeout > 60000) {
			timeout = 60000;
		}
		setTimeout(connectWs, timeout);
	};
	
	var showWeather = function(json) {
		jQuery('#loading').hide();
		jQuery('.panel.hidden').show();
		jQuery('#updated').html(new Date(json.timestamp) + ' for <strong>' + points[json.point].name + '</strong>');
		jQuery('#summary').text(json.currently.summary);
		if (json.currently.precipType != null) {
			jQuery('#summary').text(jQuery('#summary').text() + '; ' + json.currently.precipType);
		}
		jQuery('#temp').text(json.currently.temperature);
		jQuery('#dew').text(json.currently.dewPoint);
		jQuery('#pressure').text(json.currently.pressure);
		jQuery('#wind').text(json.currently.windSpeed);
		jQuery('#wind-bear').text(json.currently.windBearing);
		if (json.currently.cloudCover['$numberLong'] != null) {
			jQuery('#clouds').text(json.currently.cloudCover['$numberLong']);
		}
		else {
			jQuery('#clouds').text(json.currently.cloudCover);
		}
		if (json.currently.precipIntensity['$numberLong'] != null) {
			jQuery('#precip').text(json.currently.precipIntensity['$numberLong']);
		}
		else {
			jQuery('#precip').text(json.currently.precipIntensity);
		}
		if (json.currently.precipIntensity['$numberLong'] != null) {
			jQuery('#precip-prob').text(json.currently.precipProbability['$numberLong']);
		}
		else {
			jQuery('#precip-prob').text(json.currently.precipProbability);
		}
		jQuery('#humid').text(json.currently.humidity);
		jQuery('#forecast24').text(json.hourly.summary);
		jQuery('#forecast7').text(json.daily.summary);
		
		chart.draw(json);
	};
	
	var getUrlVars = function() {
	    var vars = {};
	    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
	    function(m,key,value) {
	      vars[key] = value;
	    });
	    return vars;
	};
	
	return {
		init : function(params) {
			if (getUrlVars()['lt'] != null) {
				lt = getUrlVars()['lt'];
			}
			connectWs();
		},
		
		changeChannel : function(newPoint) {
			ws.send(JSON.stringify({cmd: 'rem_channel', point: point}));
			ws.send(JSON.stringify({cmd: 'add_channel', point: newPoint}));
			point = newPoint;
		}
	}
}

var clientApp = new com.lypnyky.meteo.ClientApp();
jQuery(document).ready(function() {
	clientApp.init();
});