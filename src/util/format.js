/**
 *    轻量级的模板格式化函数
 *    eg:
 *
 *    //格式化输出
 *    format("<h1>#{title}</h1>", {
 *      title:"标题"
 *    });
 *
 *    //多个参数
 *    format("<dl><dt>#{1}</dt><dd>#{2}</dd></dl>", "标题", "描述");
 *
 *    //转义
 *    format("<h1>#{title|e}</h1>", {
 *      title:"标题>>"
 *    });
 *
 *    //函数
 *    format("<h1>#{getTitle}</h1>", {
 *      getTitle:function(key){
 *          return "标题>>";
 *      }
 *    });
 */

/**
 * format 字符串格式化工具
 *
 * @param {string} source
 * @param {object} opts
 * @param {object} configs
 * @access public
 * @return string 格式化后的字符串
 */

function format(source, opts, config) {
	var data = Array.prototype.slice.call(arguments, 1);
	var toString = Object.prototype.toString;

	// object as config
	if (typeof data[1] === 'object') {
		data = data.slice(1);
	}
	config = config || {};
	var ld = config.ld || '\{';
	var rd = config.rd || '\}';
	var regex = new RegExp("#" + ld + "(.+?)" + rd, "g");

	if (data.length) {
		/* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
		data = data.length == 1 ? (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) : data;
		return source.replace(regex, function(match, key) {
			var filters, replacer, i, len, func;
			if (!data) return '';
			filters = key.split("|");
			replacer = data[filters[0]];
			// chrome 下 typeof /a/ == 'function'
			if ('[object Function]' == toString.call(replacer)) {
				replacer = replacer(filters[0] /*key*/ );
			}
			for (i = 1, len = filters.length; i < len; ++i) {
				func = format.filters[filters[i]];
				if ('[object Function]' == toString.call(func)) {
					replacer = func(replacer);
				}
			}
			return (('undefined' == typeof replacer || replacer === null) ? '' : replacer);
		});
	}
	return source;
};

format.filters = {
	'escapeJs': function(str) {
		if (!str || 'string' != typeof str) return str;
		var i, len, charCode, ret = [];
		for (i = 0, len = str.length; i < len; ++i) {
			charCode = str.charCodeAt(i);
			if (charCode > 255) {
				ret.push(str.charAt(i));
			} else {
				ret.push('\\x' + charCode.toString(16));
			}
		}
		return ret.join('');
	},
	'escapeString': function(str) {
		if (!str || 'string' != typeof str) return str;
		return str.replace(/["'<>\\\/`]/g, function($0) {
			return '&#' + $0.charCodeAt(0) + ';';
		});
	},
	'escapeUrl': function(str) {
		if (!str || 'string' != typeof str) return str;
		return encodeURIComponent(str);
	},
	'toInt': function(str) {
		return parseInt(str, 10) || 0;
	}
};

format.filters.js = format.filters.escapeJs;
format.filters.e = format.filters.escapeString;
format.filters.u = format.filters.escapeUrl;
format.filters.i = format.filters.toInt;

module.exports = format;
