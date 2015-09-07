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
	return new Date(date - (+date % DAY_TIMESTAMP));
}

module.exports = {
	format: format,
	getZeroDate: getZeroDate,
	DAY_TIMESTAMP: DAY_TIMESTAMP,
	MINUTE_TIMESTAMP: MINUTE_TIMESTAMP
};