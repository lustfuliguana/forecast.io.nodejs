var com = com || {};
com.lypnyky = com.lypnyky || {};
com.lypnyky.meteo = com.lypnyky.meteo || {};

com.lypnyky.meteo.Chart = function() {
	
	var json = null;
	var h48 = true;
	
	var yaxis = {
			temp: {name: 'Temperature', color: '#aacc55'},
			tempmax: {name: 'Temperature (max)', color: '#aacc11'},
			tempmin: {name: 'Temperature (min)', color: '#a00c55'},
			dew: {name: 'Dew point', color: '#aacc55'},
			
			pint: {name: 'Precip. intensity', color: '#aacc55'},
			pintmax: {name: 'Precip. intensity (max)', color: '#22cc55'},
			
			pprob: {name: 'Precip. probability', color: '#aacc55'},
			hum: {name: 'Humidity', color: '#aacc55'},
			ws: {name: 'Wind speed', color: '#aacc55'},
			wb: {name: 'Wind bearing', color: '#aacc55'},
			cloud: {name: 'Cloud cover', color: '#aacc55'},
			press: {name: 'Pressure', color: '#aacc55'},
			ozone: {name: 'Ozone', color: '#aacc55'},
			visibility: {name: 'Visibility', color: '#abbb55'}
	};
	
	var getYAxisCfg = function(params) {
		return {
            title: {
                text: params.name
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: params.color
            }]
        };
	};
	
	var getSelectedYAxis = function() {
		var res = [];
		var chboxs = jQuery('.chart-axis:checked');
		for (var i = 0; i < chboxs.length; i++) {
			res[res.length] = chboxs.eq(i).attr('data-key');
		}
		return res;
	};
	
	var getDateLabel = function(timestamp) {
		var now = new Date();
		var dt = new Date(timestamp);
		var str = '';
		if (dt.getDay() == now.getDay()) {
			str = str + 'Today';
		}
		else if (dt.getDay() == 0) {
			str = str + 'Sun';
		}
		else if (dt.getDay() == 1) {
			str = str + 'Mon';
		}
		else if (dt.getDay() == 2) {
			str = str + 'Tue';
		}
		else if (dt.getDay() == 3) {
			str = str + 'Wed';
		}
		else if (dt.getDay() == 4) {
			str = str + 'Thu';
		}
		else if (dt.getDay() == 5) {
			str = str + 'Fri';
		}
		else if (dt.getDay() == 6) {
			str = str + 'Sat';
		}
		return str;
	};
	
	var getDateTimeLabel = function(timestamp) {
		var now = new Date();
		var dt = new Date(timestamp);
		var str = '';
		if (dt.getDay() != now.getDay()) {
			if (dt.getDay() == 0) {
				str = str + 'Sun';
			}
			else if (dt.getDay() == 1) {
				str = str + 'Mon';
			}
			else if (dt.getDay() == 2) {
				str = str + 'Tue';
			}
			else if (dt.getDay() == 3) {
				str = str + 'Wed';
			}
			else if (dt.getDay() == 4) {
				str = str + 'Thu';
			}
			else if (dt.getDay() == 5) {
				str = str + 'Fri';
			}
			else if (dt.getDay() == 6) {
				str = str + 'Sat';
			}
		}
		str = str + ' ';
		if (dt.getHours() < 10) {
			str = str + '0';
		}
		str = str + dt.getHours() + ':';
		if (dt.getMinutes() < 10) {
			str = str + '0';
		}
		return str + dt.getMinutes();
	};
	
	var getSeriesCfg = function(name, data, yAxisIndex) {
		return {
        	name: name,
        	data: data,
        	yAxis: yAxisIndex
        };
	};
	
	var showChart = function(data) {
		if (data != null) {
			json = data;
		}
		var records = json.hourly;
		if (h48 === false) {
			records = json.daily;
		}
		var yaxisCfg = [];
		var enabledYAxis = getSelectedYAxis();
		for (var i = 0; i < enabledYAxis.length; i++) {
			if (enabledYAxis[i].indexOf('temp') != -1) {
				continue;
			}
			if (enabledYAxis[i].indexOf('dew') != -1) {
				continue;
			}
			if (enabledYAxis[i].indexOf('pint') != -1) {
				continue;
			}
			yaxisCfg[yaxisCfg.length] = getYAxisCfg(yaxis[enabledYAxis[i]]);
		}
		
		for (var i = 0; i < enabledYAxis.length; i++) {
			if (enabledYAxis[i].indexOf('temp') == -1 && enabledYAxis[i].indexOf('dew') == -1) {
				continue;
			}
			yaxisCfg[yaxisCfg.length] = getYAxisCfg(yaxis.temp);
			break;
		}
		
		for (var i = 0; i < enabledYAxis.length; i++) {
			if (enabledYAxis[i].indexOf('pint') == -1) {
				continue;
			}
			yaxisCfg[yaxisCfg.length] = getYAxisCfg(yaxis.pint);
			break;
		}
		
		var ydata = {
				temp: [],
				press: [],
				ws: [],
				wb: [],
				cloud: [],
				pint: [],
				pprob: [],
				dew: [],
				hum: [],
				ozone: [],
				tempmax: [],
				tempmin: [],
				pintmax: [],
				visibility: []
		};
		var xdata = [];
		
		for(var i = 0; i < records.data.length; i++) {
			ydata.temp[ydata.temp.length] = records.data[i].temperature;
			ydata.press[ydata.press.length] = records.data[i].pressure;
			ydata.ws[ydata.ws.length] = records.data[i].windSpeed;
			ydata.wb[ydata.wb.length] = records.data[i].windBearing;
			ydata.cloud[ydata.cloud.length] = records.data[i].cloudCover;
			ydata.pprob[ydata.pprob.length] = records.data[i].precipProbability;
			ydata.pint[ydata.pint.length] = records.data[i].precipIntensity;
			ydata.dew[ydata.dew.length] = records.data[i].dewPoint;
			ydata.hum[ydata.hum.length] = records.data[i].humidity;
			ydata.ozone[ydata.ozone.length] = records.data[i].ozone;
			ydata.tempmax[ydata.tempmax.length] = records.data[i].temperatureMax;
			ydata.tempmin[ydata.tempmin.length] = records.data[i].temperatureMin;
			ydata.pintmax[ydata.pintmax.length] = records.data[i].precipIntensityMax;
			ydata.visibility[ydata.visibility.length] = records.data[i].visibility;
			
			if (h48 === true) {
				xdata[xdata.length] = getDateTimeLabel(records.data[i].time*1000);
			}
			else {
				xdata[xdata.length] = getDateLabel(records.data[i].time*1000);
			}
		}
		
		var series = [];
		var index = 0;
		for (var i = 0; i < enabledYAxis.length; i++) {
			if (enabledYAxis[i].indexOf('temp') != -1) {
				continue;
			}
			if (enabledYAxis[i].indexOf('dew') != -1) {
				continue;
			}
			if (enabledYAxis[i].indexOf('pint') != -1) {
				continue;
			}
			series[series.length] = getSeriesCfg(yaxis[enabledYAxis[i]].name, ydata[enabledYAxis[i]], index);
			index = index +1;
		}
		
		var tempAxisIndex = -1;
		for (var i = 0; i < enabledYAxis.length; i++) {
			if (enabledYAxis[i].indexOf('pint') == -1) {
				continue;
			}
			series[series.length] = getSeriesCfg(yaxis[enabledYAxis[i]].name, ydata[enabledYAxis[i]], yaxisCfg.length-1);
			if (tempAxisIndex == -1) {
				tempAxisIndex = yaxisCfg.length-2;
			}
		}
		if (tempAxisIndex == -1) {
			tempAxisIndex = yaxisCfg.length-1;
		}
		for (var i = 0; i < enabledYAxis.length; i++) {
			if (enabledYAxis[i].indexOf('temp') == -1 && enabledYAxis[i].indexOf('dew') == -1) {
				continue;
			}
			series[series.length] = getSeriesCfg(yaxis[enabledYAxis[i]].name, ydata[enabledYAxis[i]], tempAxisIndex);
		}
		
		var title = 'Forecast 48h';
		if (h48 === false) {
			title = 'Forecast 7d';
		}
		
		$('#charts').highcharts({
	        title: {
	            text: title,
	        },
	        subtitle: {
	        	text: json.point
	        },
	        xAxis: {
	            categories: xdata
	        },
	        yAxis: yaxisCfg,
	        legend: {
	            layout: 'vertical',
	            align: 'right',
	            verticalAlign: 'middle',
	            borderWidth: 0
	        },
	        series: series
	    });
	};
	
	var updateMode = function() {
		if (jQuery('input[name=forecastPeriod]:checked').val() === '48h') {
			h48 = true;
			jQuery('.d7 input:checked').attr('checked', false);
			jQuery('.d7').hide();
			jQuery('.h48').show();
		}
		else {
			h48 = false;
			jQuery('.h48 input:checked').attr('checked', false);
			jQuery('.h48').hide();
			jQuery('.d7').show();
		}
	};
	
	return {
		init : function(params) {
		},
		
		draw : function(data) {
			showChart(data);
		},
		
		set48hmode : function() {
			updateMode();
			showChart();
		}
	}
}

var chart = new com.lypnyky.meteo.Chart();
jQuery(document).ready(function() {
	chart.init();
});