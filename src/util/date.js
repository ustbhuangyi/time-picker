'use strict';

var DAY_TIMESTAMP = 60 * 60 * 24 * 1000;
var HOUR_TIMESTAMP = 60 * 60 * 1000;
var MINUTE_TIMESTAMP = 60 * 1000;

function format(date, fmt) {
	var o = {
		"M+": date.getMonth() + 1,                 //月份
		"d+": date.getDate(),                    //日
		"h+": date.getHours(),                   //小时
		"m+": date.getMinutes(),                 //分
		"s+": date.getSeconds(),                 //秒
		"q+": Math.floor((date.getMonth() + 3) / 3), //季度
		"S": date.getMilliseconds()             //毫秒
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

function getZeroDate(date) {
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	return new Date(year + '/' + month + '/' + day + ' 00:00:00');
}

module.exports = {
	format: format,
	getZeroDate: getZeroDate,
	DAY_TIMESTAMP: DAY_TIMESTAMP,
	HOUR_TIMESTAMP: HOUR_TIMESTAMP,
	MINUTE_TIMESTAMP: MINUTE_TIMESTAMP
};