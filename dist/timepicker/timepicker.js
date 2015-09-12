/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);
	var each = _.each;
	var format = _.format;
	var easing = _.easing;
	var Timeline = _.Timeline;
	var date = _.date;
	var log = _.log;

	var DIREACTION_UP = 'up';
	var DIREACTION_DOWN = 'down';


	(function (gmu, $, undefined) {
		gmu.define('timePicker', {
			options: {
				inputTpl: '<span>#{placeHolder}</span>',
				listTpl: '<div class="timepicker">' +
				'<div class="panel panel-hook">' +
				'<div class="choose">' +
				'<span class="cancel cancel-hook">取消</span>' +
				'<span class="confirm confirm-hook">确定</span>' +
				'</div>' +
				'<div class="wheel wheel-hook">' +
				'<ul class="day day-hook"></ul>' +
				'<ul class="hour hour-hook"></ul>' +
				'<ul class="minute minute-hook"></ul>' +
				'</div>' +
				'<div class="center">' +
				'<ul class="daymirror daymirror-hook"></ul>' +
				'<ul class="hourmirror hourmirror-hook"></ul>' +
				'<ul class="minutemirror minutemirror-hook"></ul>' +
				'</div>' +
				'</div>' +
				'</div>',
				itemTpl: '<li data-val="#{val}" data-index="#{index}" class="item #{current}">#{text}</li>',
				day: {
					step: 1,
					len: 7,
					filter: ['今天', '明天', '后天'],
					format: 'M月d日'
				},
				hour: {
					step: 1,
					min: 0,
					max: 23
				},
				minute: {
					step: 10,
					min: 0,
					max: 50
				},
				delay: 0,
				currentDate: 0,
				rate: {
					translateY: 0.4,
					translateX: 0.1,
					skewX: 0.1
				},
				step: {
					len: 20,
					deg: 25
				},
				wheel: {
					height: 160,
					centerPadding: 4
				},
				velocity: 300,
				threshold: 15,
				moveThreshold: 5,
				swipeDuration: 2500,
				swipeDefaultStep: 4,
				rollbackDuration: 1000,
				backDuration: 500,
				adjustDuration: 400,
				runDuration: 300,
				showCls: 'show',
				placeHolder: '请选择日期'
			},
			_create: function () {
				this.$list = $(this._options.listTpl).appendTo($(document.body));

				this.$panel = $('.panel-hook', this.$list);
				this.$wheel = $('.wheel-hook', this.$list);

				this.$day = $('.day-hook', this.$list);
				this.$daymirror = $('.daymirror-hook', this.$list);

				this.$hour = $('.hour-hook', this.$list);
				this.$hourmirror = $('.hourmirror-hook', this.$list);

				this.$minute = $('.minute-hook', this.$list);
				this.$minutemirror = $('.minutemirror-hook', this.$list);

				this.$cancel = $('.cancel-hook', this.$list);
				this.$confirm = $('.confirm-hook', this.$list);

				this.$datetext = $(format(this._options.inputTpl, {
					placeHolder: this._options.placeHolder
				})).appendTo(this.$el);

				this.transformKey = $.fx.cssPrefix + 'transform';
				this.windowHeight = document.documentElement.clientHeight;

				this._bindEvent();
			},
			_init: function () {
				this.now = new Date(+new Date + this._options.delay * date.MINUTE_TIMESTAMP);

				var currentDate = this.$el.data('currentDate') || this._options.currentDate;
				if (currentDate < this.now) {
					currentDate = undefined;
				}
				this.currentDate = currentDate ? new Date(currentDate) : this.now;

				this._initMinutes();

				this._initHours();

				this._initDays();

			},
			_initMinutes: function () {
				this.minutes = this._genMinutes();
				var minuteConf = this._options.minute;
				var current = Math.ceil(this.currentDate.getMinutes() / minuteConf.step) % this.minutes.length;
				var begin = Math.ceil(this.now.getMinutes() / minuteConf.step) % this.minutes.length;
				//var delay = this._options.delay;
				if (this.currentDate.getMinutes() >= minuteConf.max) {
					this.currentHourCarry = 1;
				} else {
					this.currentHourCarry = 0;
				}
				if (this.now.getMinutes() >= minuteConf.max) {
					this.beginHourCarry = 1;
				} else {
					this.beginHourCarry = 0;
				}
				var end = this.minutes.length - 1;
				this._fillMinutes(begin, end, current);
			},
			_genMinutes: function () {
				var minutes = [];
				var minuteConf = this._options.minute;
				for (var i = minuteConf.min; i <= minuteConf.max; i += minuteConf.step) {
					minutes.push({
						val: i,
						text: this._formatNum(i) + '分'
					});
				}
				return minutes;
			},
			_fillMinutes: function (begin, end, current) {
				var minutes = this.minutes.slice(begin);
				var tpl = [];
				each(minutes, function (item, index) {
					tpl.push(format(this._options.itemTpl, {
						val: item.val,
						text: item.text,
						index: index + begin,
						current: item.val === this.minutes[current].val ? 'current' : ''
					}));
				}, this);
				var strTpl = tpl.join('');
				this.$minute.html('');
				this.$minuteitems = $(strTpl).appendTo(this.$minute);

				this.$minutemirror.html('');
				this.$minutemirroritems = $(strTpl).appendTo(this.$minutemirror);

				this.$minute.data('current', current - begin);

				this._initWheel(this.$minute, this.$minuteitems, current, begin, end, 'normal.right');
				this._initWheel(this.$minutemirror, this.$minutemirroritems, current, begin, end, 'mirror.right');

			},
			_initHours: function () {
				this.hours = this._genHours();
				var hourConf = this._options.hour;
				var current = Math.ceil((this.currentDate.getHours() + this.currentHourCarry) / hourConf.step) % this.hours.length;
				var begin = Math.ceil((this.now.getHours() + this.beginHourCarry) / hourConf.step) % this.hours.length;

				if (this.currentHourCarry && this.currentDate.getHours() === 0) {
					this.currentDayCarry = 1;
				} else {
					this.currentDayCarry = 0;
				}
				if (this.beginHourCarry && this.now.getHours() === 0) {
					this.beginDayCarry = 1;
				} else {
					this.beginDayCarry = 0;
				}
				var end = this.hours.length - 1;
				this._fillHours(begin, end, current);
			},
			_genHours: function () {
				var hours = [];
				var hourConf = this._options.hour;
				for (var i = hourConf.min; i <= hourConf.max; i += hourConf.step) {
					hours.push({
						val: i,
						text: i + '点'
					});
				}
				return hours;
			},
			_fillHours: function (begin, end, current) {
				var hours = this.hours.slice(begin);
				var tpl = [];
				each(hours, function (item, index) {
					tpl.push(format(this._options.itemTpl, {
						val: item.val,
						text: item.text,
						index: index + begin,
						current: item.val === this.hours[current].val ? 'current' : ''
					}));
				}, this);
				var strTpl = tpl.join('');
				this.$hour.html('');
				this.$houritems = $(strTpl).appendTo(this.$hour);

				this.$hourmirror.html('');
				this.$hourmirroritems = $(strTpl).appendTo(this.$hourmirror);

				this.$hour.data('current', current - begin);

				this._initWheel(this.$hour, this.$houritems, current, begin, end, 'normal.middle');
				this._initWheel(this.$hourmirror, this.$hourmirroritems, current, begin, end, 'mirror.middle');
			},
			_initDays: function () {
				this.days = this._genDays();
				var current = (+date.getZeroDate(this.currentDate) - +date.getZeroDate(this.now)) / date.DAY_TIMESTAMP + this.currentDayCarry;
				var begin = 0 + this.beginDayCarry;
				var end = this.days.length - 1;
				this._fillDays(begin, end, current);
			},
			_genDays: function () {
				var days = [];
				var dayConf = this._options.day;
				var zeroTimestamp = +date.getZeroDate(this.now);

				var format = dayConf.format;
				for (var i = 0; i < dayConf.len; i += dayConf.step) {
					var timestamp = zeroTimestamp + i * date.DAY_TIMESTAMP;

					if (dayConf.filter && i < dayConf.filter.length) {
						days.push({
							val: timestamp,
							text: dayConf.filter[i]
						});
					} else {
						days.push({
							val: timestamp,
							text: date.format(new Date(timestamp), format)
						});
					}
				}
				return days;
			},
			_fillDays: function (begin, end, current) {
				var days = this.days.slice(begin);
				var tpl = [];
				each(days, function (item, index) {
					tpl.push(format(this._options.itemTpl, {
						val: item.val,
						text: item.text,
						index: index + begin,
						current: item.val === this.days[current].val ? 'current' : ''
					}));
				}, this);
				var strTpl = tpl.join('');
				this.$day.html('');
				this.$dayitems = $(strTpl).appendTo(this.$day);

				this.$daymirror.html('');
				this.$daymirroritems = $(strTpl).appendTo(this.$daymirror);

				this.$day.data('current', current - begin);
				this._initWheel(this.$day, this.$dayitems, current, begin, end, 'normal.left');
				this._initWheel(this.$daymirror, this.$daymirroritems, current, begin, end, 'mirror.left');

			},
			_initWheel: function ($wheel, $items, current, begin, end, type) {

				var steplen = this._options.step.len;

				var yTranslate = -steplen * (current - begin);
				var cssValue = {};
				cssValue[this.transformKey] = 'translateY(' + yTranslate + 'px)';
				cssValue['paddingBottom'] = (end - begin) * steplen + this._options.wheel.height / 2 - steplen / 2;
				$wheel.css(cssValue)
					.data('yTranslate', yTranslate)
					.data('tmpYTranslate', '')
					.data('begin', begin)
					.data('end', end);

				this._setItemsDeg($items, yTranslate, begin, type);

			},
			_bindEvent: function () {

				this.$list.on('touchstart', function (e) {
					e.preventDefault();
				});

				this._bindMinuteEvent();

				this._bindHourEvent();

				this._bindDayEvent();

				var me = this;
				this.$el.on('touchstart', function () {
					me.show();
				});

				this.$cancel.on('touchstart', function () {
					me.hide();
				});

				this.$confirm.on('touchstart', function () {
					me._confirm();
					me.hide();
				});

			},
			_bindMinuteEvent: function () {
				var me = this;
				var timer = 0;
				var touch = {};
				var start;
				var delta;
				var firstTouch;
				var stopped;

				this.$minute.on('touchstart', onTouchStart).
					on('touchmove', onTouchMove).
					on('touchend', onTouchEnd);

				this.$minutemirror.on('touchstart', onTouchStart).
					on('touchmove', onTouchMove).
					on('touchend', onTouchEnd);


				function onTouchStart(e) {
					if (stopped) {
						stopped = false;
					}

					firstTouch = e.touches[0];
					touch.y1 = firstTouch.pageY;

					start = +new Date;

					clearTimeout(timer);
					if (me.$minute.data('isRunning')) {
						me.$minute.data('needStop', true);
					}

					if (me.$minutemirror.data('isRunning')) {
						me.$minutemirror.data('needStop', true);
					}

					if (me.$minute.data('tmpYTranslate') || me.$minute.data('tmpYTranslate') === 0) {
						me.$minute.data('yTranslate', me.$minute.data('tmpYTranslate'));
					}

					if (me.$minutemirror.data('tmpYTranslate') || me.$minutemirror.data('tmpYTranslate') === 0) {
						me.$minutemirror.data('yTranslate', me.$minutemirror.data('tmpYTranslate'));
					}

					e.preventDefault();
				}

				function onTouchMove(e) {
					if (stopped) {
						return;
					}

					firstTouch = e.touches[0];

					touch.y2 = firstTouch.pageY;

					if (touch.y2 > me.windowHeight || touch.y2 < 0) {
						onTouchEnd();
						return;
					}

					var distance = touch.y2 - touch.y1;

					me._wheelMove(me.$minute, me.$minuteitems, {
						distance: distance,
						type: 'normal.right'
					});
					me._wheelMove(me.$minutemirror, me.$minutemirroritems, {
						distance: distance,
						type: 'mirror.right'
					});


				}

				function onTouchEnd() {
					if (!stopped) {
						stopped = true;
					}

					touch.y2 = firstTouch.pageY;

					var duration = +new Date - start;
					delta = touch.y2 - touch.y1;

					var direction = delta > 0 ? DIREACTION_DOWN : DIREACTION_UP;

					delta = Math.abs(delta);

					if (duration < me._options.velocity && delta > me._options.threshold) {
						var runStep = me._getRunStepBySwipe(delta);

						me._wheelSwipe(me.$minute, me.$minuteitems, {
							direction: direction,
							runStep: runStep,
							delta: delta,
							type: 'normal.right'
						}, onWheelStop);
						me._wheelSwipe(me.$minutemirror, me.$minutemirroritems, {
							direction: direction,
							runStep: runStep,
							delta: delta,
							type: 'mirror.right'
						});
					}
					else {
						clearTimeout(timer);
						var offsetY;
						if (delta === 0) {
							offsetY = touch.y2 - me.$wheel.offset().top;
						}
						timer = setTimeout(function () {
							if (!me.$minute.data('isRunning')) {
								me._wheelAdjust(me.$minute, me.$minuteitems, {
									type: 'normal.right',
									delta: delta,
									offsetY: offsetY
								}, onWheelStop);
							}
							if (!me.$minutemirror.data('isRunning')) {
								me._wheelAdjust(me.$minutemirror, me.$minutemirroritems, {
									type: 'mirror.right',
									delta: delta,
									offsetY: offsetY
								});
							}
						}, 20);
					}

				}

				function onWheelStop(current) {

					me.$minute.data('current', current);
					me.trigger('minute.stop', current);
				}

				me.on('day.stop', function (e, currentDay) {
					var currentMinute;

					if (!me.$minute.data('isRunning')) {
						currentMinute = me.$minute.data('current');
						reFillByDay(currentDay, currentMinute);
					} else {

						me.one('minute.stop', function (e, currentMinute) {
							if (me.$minutemirror.data('isRunning')) {
								me.$minutemirror.data('needStop', true);
							}
							reFillByDay(currentDay, currentMinute);
						});
					}
				});

				me.on('hour.stop', function (e, currentHour) {

					if (!me.$day.data('isRunning')) {
						var currentMinute;
						var currentDay = me.$day.data('current');

						if (!me.$minute.data('isRunning')) {
							currentMinute = me.$minute.data('current');

							reFillByHour(currentHour, currentMinute, currentDay);
						} else {
							me.one('minute.stop', function (e, currentMinute) {
								if (me.$minutemirror.data('isRunning')) {
									me.$minutemirror.data('needStop', true);
								}
								reFillByHour(currentHour, currentMinute, currentDay);
							});
						}
					}
				});

				function reFillByDay(currentDay, currentMinute) {
					var begin;
					var end = me.minutes.length - 1;
					var minuteConf = me._options.minute;
					if (currentDay > 0) {
						begin = 0;
						currentMinute = Math.min(minuteConf.max, currentMinute + begin);
						me._fillMinutes(begin, end, currentMinute);
					} else {
						if (!me.$hour.data('isRunning')) {
							var currentHour = me.$hour.data('current');
							reFillByHour(currentHour, currentMinute);
						}
					}
				}

				function reFillByHour(currentHour, currentMinute, currentDay) {
					var begin;
					var end = me.minutes.length - 1;
					var minuteConf = me._options.minute;
					if (currentDay > 0) {
						begin = 0;
					} else {
						if (currentHour > 0) {
							begin = 0;
						} else {
							begin = Math.ceil(me.now.getMinutes() / minuteConf.step) % me.minutes.length;
						}
					}

					currentMinute = Math.min(end, currentMinute + begin);

					me._fillMinutes(begin, end, currentMinute);
				}
			},
			_bindHourEvent: function () {
				var me = this;
				var timer = 0;
				var touch = {};
				var start;
				var delta;
				var firstTouch;
				var stopped;

				this.$hour.on('touchstart', onTouchStart).
					on('touchmove', onTouchMove).
					on('touchend', onTouchEnd);

				this.$hourmirror.on('touchstart', onTouchStart).
					on('touchmove', onTouchMove).
					on('touchend', onTouchEnd);

				function onTouchStart(e) {
					if (stopped) {
						stopped = false;
					}

					firstTouch = e.touches[0];
					touch.y1 = firstTouch.pageY;

					start = +new Date;

					clearTimeout(timer);
					if (me.$hour.data('isRunning')) {
						me.$hour.data('needStop', true);
					}

					if (me.$hourmirror.data('isRunning')) {
						me.$hourmirror.data('needStop', true);
					}

					if (me.$hour.data('tmpYTranslate') || me.$hour.data('tmpYTranslate') === 0) {
						me.$hour.data('yTranslate', me.$hour.data('tmpYTranslate'));
					}

					if (me.$hourmirror.data('tmpYTranslate') || me.$hourmirror.data('tmpYTranslate') === 0) {
						me.$hourmirror.data('yTranslate', me.$hourmirror.data('tmpYTranslate'));
					}

					e.preventDefault();
				}

				function onTouchMove(e) {
					if (stopped) {
						return;
					}

					firstTouch = e.touches[0];
					touch.y2 = firstTouch.pageY;

					if (touch.y2 > me.windowHeight || touch.y2 < 0) {
						onTouchEnd();
						return;
					}

					var distance = touch.y2 - touch.y1;

					me._wheelMove(me.$hour, me.$houritems, {
						distance: distance,
						type: 'normal.middle'
					});
					me._wheelMove(me.$hourmirror, me.$hourmirroritems, {
						distance: distance,
						type: 'mirror.middle'
					});

				}

				function onTouchEnd() {
					if (!stopped) {
						stopped = true;
					}

					touch.y2 = firstTouch.pageY;

					var duration = +new Date - start;
					delta = touch.y2 - touch.y1;

					var direction = delta > 0 ? DIREACTION_DOWN : DIREACTION_UP;

					delta = Math.abs(delta);
					if (duration < me._options.velocity && delta > me._options.threshold) {
						var runStep = me._getRunStepBySwipe(delta);

						me._wheelSwipe(me.$hour, me.$houritems, {
							direction: direction,
							runStep: runStep,
							delta: delta,
							type: 'normal.middle'
						}, onWheelStop);
						me._wheelSwipe(me.$hourmirror, me.$hourmirroritems, {
							direction: direction,
							runStep: runStep,
							delta: delta,
							type: 'mirror.middle'
						});
					}
					else {
						clearTimeout(timer);
						var offsetY;
						if (delta === 0) {
							offsetY = touch.y2 - me.$wheel.offset().top;
						}
						timer = setTimeout(function () {
							if (!me.$hour.data('isRunning')) {
								me._wheelAdjust(me.$hour, me.$houritems, {
									type: 'normal.middle',
									delta: delta,
									offsetY: offsetY
								}, onWheelStop);
							}
							if (!me.$hourmirror.data('isRunning')) {
								me._wheelAdjust(me.$hourmirror, me.$hourmirroritems, {
									type: 'mirror.middle',
									delta: delta,
									offsetY: offsetY
								});
							}
						}, 20);
					}

				}

				function onWheelStop(current) {
					me.$hour.data('current', current);
					me.trigger('hour.stop', current);
				}

				me.on('day.stop', function (e, currentDay) {

					var currentHour;
					if (!me.$hour.data('isRunning')) {
						currentHour = me.$hour.data('current');
						reFillHours(currentDay, currentHour);
					} else {
						me.one('hour.stop', function (e, currentHour) {
							if (me.$hourmirror.data('isRunning')) {
								me.$hourmirror.data('needStop', true);
							}
							reFillHours(currentDay, currentHour);
						})
					}
				});

				function reFillHours(currentDay, currentHour) {
					var begin;
					var end = me.hours.length - 1;
					var hourConf = me._options.hour;
					if (currentDay > 0) {
						begin = 0;
					} else {
						begin = Math.ceil((me.now.getHours() + me.currentHourCarry) / hourConf.step) % me.hours.length;
					}

					currentHour = Math.min(end, currentHour + begin);

					me._fillHours(begin, end, currentHour)
				}
			},
			_bindDayEvent: function () {
				var me = this;
				var timer = 0;
				var touch = {};
				var start;
				var delta;
				var firstTouch;
				var stopped;

				this.$day.on('touchstart', onTouchStart).
					on('touchmove', onTouchMove).
					on('touchend', onTouchEnd);

				this.$daymirror.on('touchstart', onTouchStart).
					on('touchmove', onTouchMove).
					on('touchend', onTouchEnd);

				function onTouchStart(e) {
					if (stopped) {
						stopped = false;
					}

					firstTouch = e.touches[0];
					touch.y1 = firstTouch.pageY;

					start = +new Date;

					clearTimeout(timer);
					if (me.$day.data('isRunning')) {
						me.$day.data('needStop', true);
					}

					if (me.$daymirror.data('isRunning')) {
						me.$daymirror.data('needStop', true);
					}

					if (me.$day.data('tmpYTranslate') || me.$day.data('tmpYTranslate') === 0) {
						me.$day.data('yTranslate', me.$day.data('tmpYTranslate'));
					}

					if (me.$daymirror.data('tmpYTranslate') || me.$daymirror.data('tmpYTranslate') === 0) {
						me.$daymirror.data('yTranslate', me.$daymirror.data('tmpYTranslate'));
					}

					e.preventDefault();
				}

				function onTouchMove(e) {
					if (stopped) {
						return;
					}

					firstTouch = e.touches[0];
					touch.y2 = firstTouch.pageY;

					if (touch.y2 > me.windowHeight || touch.y2 < 0) {
						onTouchEnd();
						return;
					}

					var distance = touch.y2 - touch.y1;

					me._wheelMove(me.$day, me.$dayitems, {
						distance: distance,
						type: 'normal.left'
					});
					me._wheelMove(me.$daymirror, me.$daymirroritems, {
						distance: distance,
						type: 'mirror.left'
					});
				}

				function onTouchEnd() {
					if (!stopped) {
						stopped = true;
					}

					touch.y2 = firstTouch.pageY;

					var duration = +new Date - start;
					delta = touch.y2 - touch.y1;

					var direction = delta > 0 ? DIREACTION_DOWN : DIREACTION_UP;

					delta = Math.abs(delta);

					//swipe
					if (duration < me._options.velocity && delta > me._options.threshold) {
						var runStep = me._getRunStepBySwipe(delta);

						me._wheelSwipe(me.$day, me.$dayitems, {
							direction: direction,
							runStep: runStep,
							delta: delta,
							type: 'normal.left'
						}, onWheelStop);
						me._wheelSwipe(me.$daymirror, me.$daymirroritems, {
							direction: direction,
							runStep: runStep,
							delta: delta,
							type: 'mirror.left'
						});
					}
					else {
						clearTimeout(timer);
						var offsetY;
						if (delta === 0) {
							offsetY = touch.y2 - me.$wheel.offset().top;
						}
						timer = setTimeout(function () {
							if (!me.$day.data('isRunning')) {
								me._wheelAdjust(me.$day, me.$dayitems, {
									type: 'normal.left',
									delta: delta,
									offsetY: offsetY
								}, onWheelStop);
							}
							if (!me.$daymirror.data('isRunning')) {
								me._wheelAdjust(me.$daymirror, me.$daymirroritems, {
									type: 'mirror.left',
									delta: delta,
									offsetY: offsetY
								});
							}
						}, 20);
					}

				}

				function onWheelStop(current) {
					me.$day.data('current', current);
					me.trigger('day.stop', current);
				}
			},
			_wheelMove: function ($wheel, $items, option) {

				var type = option.type;

				var distance = option.distance;

				var steplen = this._options.step.len;

				var begin = $wheel.data('begin');
				var end = $wheel.data('end');

				var maxTranslate = (end - begin) * steplen;

				var yTranslate = $wheel.data('yTranslate');

				var tmpYTranslate = $wheel.data('tmpYTranslate');

				if (tmpYTranslate && (tmpYTranslate >= 0 || tmpYTranslate <= -maxTranslate)) {
					var diff;
					if (tmpYTranslate >= 0) {
						diff = -yTranslate;
					} else {
						diff = -yTranslate - maxTranslate;
					}

					distance = (distance - diff) * 0.3 + diff;
				}

				var translate = yTranslate + distance;

				var translateCss = {};
				translateCss[this.transformKey] = 'translateY(' + translate + 'px)';
				$wheel.css(translateCss);
				$wheel.data('tmpYTranslate', translate);

				this._setItemsDeg($items, translate, begin, type);


			},
			_wheelAdjust: function ($wheel, $items, option, callback) {
				var type = option.type;
				var delta = option.delta;

				var translate = $wheel.data('tmpYTranslate');

				if (translate === undefined) {
					translate = 0;
				}


				var steplen = this._options.step.len;

				var begin = $wheel.data('begin');
				var end = $wheel.data('end');
				var maxTranslate = (end - begin) * steplen;

				var targetTranslate;
				var duration = this._options.adjustDuration;

				if (translate > 0) {
					targetTranslate = 0;
				} else if (translate < -maxTranslate) {
					targetTranslate = -maxTranslate;
				} else {

					if (delta !== 0 && translate % steplen === 0) {
						callback && callback(Math.abs(translate / steplen));
						return;
					}

					if (delta === 0 && translate % steplen === 0) {
						var offsetY = option.offsetY - this._options.wheel.height / 2;
						var runDistance;
						var centerOffset = this._options.wheel.centerPadding + steplen / 2;
						if (offsetY <= 0) {
							runDistance = Math.floor((offsetY + centerOffset) / steplen) * steplen;
						} else {
							runDistance = Math.ceil((offsetY - centerOffset) / steplen) * steplen;
						}

						targetTranslate = Math.min(0, Math.max(-maxTranslate, -runDistance + translate));
						duration = this._options.runDuration;
					} else {
						targetTranslate = Math.floor(translate / steplen) * steplen + ( Math.abs(translate % steplen) <= 10 ? steplen : 0);
					}
				}

				var direction;

				if (targetTranslate > translate) {
					direction = DIREACTION_DOWN;

				} else {
					direction = DIREACTION_UP;

				}
				var runDistance = targetTranslate - translate;
				if (runDistance === 0)
					return;
				var runOption = {
					type: type,
					direction: direction,
					runDistance: runDistance,
					duration: duration,
					easeFn: easing.easeOutQuad
				};

				this._wheelRun($wheel, $items, runOption, callback);
			},
			_wheelSwipe: function ($wheel, $items, option, callback) {

				var type = option.type;

				var direction = option.direction;
				var runStep = option.runStep;
				var delta = option.delta;

				var translate = $wheel.data('tmpYTranslate');

				if (!translate && translate !== 0)
					return;

				var steplen = this._options.step.len;
				var runDistance = runStep * steplen - delta;

				var begin = $wheel.data('begin');
				var end = $wheel.data('end');

				var maxTranslate = (end - begin) * steplen;

				var targetTranslate = this._getTargetTranslate($wheel.data('yTranslate'), maxTranslate);

				var targetDiff = Math.abs(targetTranslate - $wheel.data('yTranslate'));

				runDistance += targetDiff;

				var diff;
				if (direction === DIREACTION_DOWN) {

					diff = runDistance + translate;
				} else {

					diff = runDistance - translate - maxTranslate;
				}

				var easeExtra;
				var duration;
				var easeFn;
				if (diff > 0) {
					runDistance = direction === DIREACTION_DOWN ? -translate : -translate - maxTranslate;

					if (translate > 0 || translate < -maxTranslate) {
						duration = this._options.backDuration;
						easeFn = easing.easeInBack;
					} else {
						duration = this._options.rollbackDuration;
						easeFn = easing.easeOutBack;
						easeExtra = this._getEaseExtraByDiff(diff);
					}


				} else {
					duration = this._options.swipeDuration;
					runDistance = direction === DIREACTION_DOWN ? runDistance : -runDistance;
					easeFn = easing.easeOutQuart
				}

				var runOption = {
					type: type,
					direction: direction,
					runDistance: runDistance,
					duration: duration,
					easeFn: easeFn,
					easeExtra: easeExtra
				};

				this._wheelRun($wheel, $items, runOption, callback);

			},
			_wheelRun: function ($wheel, $items, option, callback) {
				var me = this;

				var type = option.type;
				var direction = option.direction || DIREACTION_UP;
				var runDistance = option.runDistance;
				var duration = option.duration;
				var easeFn = option.easeFn;
				var easeExtra = option.easeExtra;

				var steplen = this._options.step.len;

				var yTranslate = $wheel.data('tmpYTranslate');

				$wheel.data('isRunning', true);

				var timeline = new Timeline();
				timeline.onenterframe = function (time) {

					var needStop = $wheel.data('needStop');
					if (needStop) {
						$wheel.data('needStop', false).
							data('isRunning', false);
						this.stop();
						return;
					}

					var begin = $wheel.data('begin');
					var end = $wheel.data('end');

					var maxTranslate = (end - begin) * steplen;

					var timePercent = Math.min(1, time / duration);
					var timeup = timePercent === 1;
					//stop
					if (timeup) {

						var translate = yTranslate + runDistance;
						translate = Math.round(translate / steplen) * steplen;

						//may be NAN
						if (translate !== translate) {
							translate = 0;
						}
						//make sure translate valid
						translate = Math.min(0, Math.max(-maxTranslate, translate));

						var translateCss = {};
						translateCss[me.transformKey] = 'translateY(' + translate + 'px)';
						$wheel.data('isRunning', false)
							.data('yTranslate', translate)
							.data('tmpYTranslate', translate)
							.css(translateCss);

						me._setItemsDeg($items, translate, begin, type);

						this.stop();
						callback && callback(Math.abs(translate / steplen));
						return;
					}

					var runPercent = timePercent;

					if (easeFn) {
						runPercent = easeFn(timePercent, duration * timePercent, 0, 1, duration, easeExtra);
					}

					var translate;
					if (runPercent > 1) {
						var extra = (runPercent - 1) * steplen;
						translate = yTranslate + runDistance + (direction === DIREACTION_UP ? -extra : extra);
					} else {
						translate = yTranslate + runDistance * runPercent;
					}

					me._setItemsDeg($items, translate, begin, type);

					var translateCss = {};
					translateCss[me.transformKey] = 'translateY(' + translate + 'px)';
					$wheel.css(translateCss)
						.data('tmpYTranslate', translate);
				};
				timeline.start();
			},
			_reSetCss: function ($el, cssValue) {
				$el[0].style.cssText = '';
				$el.css(cssValue);
			},
			_getTargetTranslate: function (translate, maxTranslate) {
				var steplen = this._options.step.len;
				var targetTranslate;

				if (translate > 0) {
					targetTranslate = 0;
				} else if (translate < -maxTranslate) {
					targetTranslate = -maxTranslate;
				} else {
					if (translate % steplen === 0)
						return translate;
					targetTranslate = Math.floor(translate / steplen) * steplen + ( Math.abs(translate % steplen) <= 10 ? steplen : 0);
				}

				return targetTranslate;
			},
			_setItemsDeg: function ($items, translate, begin, type) {
				var steplen = this._options.step.len;

				var current = -translate / steplen + begin;
				var me = this;
				$items.each(function () {
					var diff = $(this).data('index') - current;
					var deg = diff * me._options.step.deg;

					var cssValue = me._getCssByDeg(deg, type);
					me._reSetCss($(this), cssValue);
				});
			},
			_getCssByDeg: function (deg, type) {
				var cssValue = {};

				var yTranslate;

				var rateConf = this._options.rate;

				if (Math.abs(deg) <= 90) {
					yTranslate = deg * rateConf.translateY + 'px';
					cssValue['visibility'] = 'visible';
				} else {
					cssValue['visibility'] = 'hidden';
				}

				var transform = 'rotateX(' + deg + 'deg) translateY(' + yTranslate + ')';

				if (/left/.test(type)) {
					var skewX = deg * rateConf.skewX;
					var xTranslate = Math.abs(deg) * rateConf.translateX;
					transform += ' skewX(' + skewX + 'deg) translateX(' + xTranslate + 'px)';
				} else if (/right/.test(type)) {
					var skewX = -deg * rateConf.skewX;
					var xTranslate = -Math.abs(deg) * rateConf.translateX;
					transform += ' skewX(' + skewX + 'deg) translateX(' + xTranslate + 'px)';
				}

				cssValue[this.transformKey] = transform;

				var color;
				if (/mirror/.test(type)) {
					color = '#000';
				} else {
					if (deg <= 30 && deg >= -30) {
						color = '#999';
					} else if (deg <= 60 && deg >= -60) {
						color = '#aaa';
					} else if (deg <= 90 && deg >= -90) {
						color = '#ccc';
					} else {
						color = '#eee';
					}
				}
				cssValue['color'] = color;

				return cssValue;
			},
			_getCurrent: function ($wheel, translate) {
				var begin = $wheel.data('begin');
				var end = $wheel.data('end');
				var steplen = this._options.step.len;

				var current = Math.max(0, Math.min(Math.round(-translate / steplen) + begin, end));

				return current;
			},
			_getRunStepBySwipe: function (distance) {
				var steplen = this._options.step.len;

				return (Math.floor(distance / steplen) + (distance % steplen < 10 ? 0 : 1)) * 4;
			},
			_getEaseExtraByDiff: function (diff) {
				return Math.min(5, diff * 0.05);
			},
			_formatNum: function (num) {
				return (('' + num).length > 1 ? num : ('0' + num))
			},
			_confirm: function () {
				var currentDay = this.$day.data('current');
				var $selectDay = this.$dayitems.eq(currentDay);

				var currentHour = this.$hour.data('current');
				var $selectHour = this.$houritems.eq(currentHour);

				var currentMinute = this.$minute.data('current');
				var $selectMinute = this.$minuteitems.eq(currentMinute);

				var showDay = $selectDay.text();
				var showHour = this._formatNum($selectHour.data('val'));
				var showMinute = this._formatNum($selectMinute.data('val'));

				var showDate = showDay + ' ' + showHour + ':' + showMinute;

				var currentDate = $selectDay.data('val') +
					$selectHour.data('val') * date.HOUR_TIMESTAMP +
					$selectMinute.data('val') * date.MINUTE_TIMESTAMP;

				this.$el.data('currentDate', currentDate);
				this.$datetext.text(showDate);

				this.trigger('date.confirm', {
					text: showDate,
					val: currentDate
				});
			},
			show: function () {
				this.$list.show();
				var showCls = this._options.showCls;

				var me = this;
				setTimeout(function () {
					me.$list.addClass(showCls);
					me.$panel.addClass(showCls);
				}, 0);


			},
			hide: function () {
				var showCls = this._options.showCls;
				this.$list.removeClass(showCls);
				this.$panel.removeClass(showCls);

				var me = this;
				setTimeout(function () {
					me.$list.hide();
				}, 500);

			}
		});
	})
	(gmu, gmu.$);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.format = __webpack_require__(2);

	exports.each = __webpack_require__(3);

	exports.easing = __webpack_require__(5);

	exports.date = __webpack_require__(6);

	exports.Timeline = __webpack_require__(7);

	exports.log = __webpack_require__(8);


/***/ },
/* 2 */
/***/ function(module, exports) {

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

	'use strict';

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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var t = __webpack_require__(4),
		hasOwn = Object.prototype.hasOwnProperty;

	module.exports = function (obj, iterator, context) {
		var i, l, type;
		if (typeof obj !== 'object') return;

		type = t(obj);
		context = context || obj;
		if (type === 'array' || type === 'arguments' || type === 'nodelist') {
			for (i = 0, l = obj.length; i < l; i++) {
				if (iterator.call(context, obj[i], i, obj) === false) return;
			}
		} else {
			for (i in obj) {
				if (hasOwn.call(obj, i)) {
					if (iterator.call(context, obj[i], i, obj) === false) return;
				}
			}
		}
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	var toString = Object.prototype.toString;

	module.exports = function (obj) {
		var type;
		if (obj == null) {
			type = String(obj);
		} else {
			type = toString.call(obj).toLowerCase();
			type = type.substring(8, type.length - 1);
		}
		return type;
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
		easeOutQuad: function (x, t, b, c, d) {
			return -c * (t /= d) * (t - 2) + b;
		},
		easeOutQuart: function (x, t, b, c, d) {
			return -c * ((t = t / d - 1) * t * t * t - 1) + b;
		},
		easeOutExpo: function (x, t, b, c, d) {
			return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
		},
		easeOutBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
		},
		easeInBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c * (t /= d) * t * ((s + 1) * t - s) + b;
		}
	};


/***/ },
/* 6 */
/***/ function(module, exports) {

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

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	var requestAnimationFrame,
		cancelAnimationFrame,
		DEFAULT_INTERVAL = 1000 / 60;

	function Timeline() {
		this.animationHandler = 0;
	}

	Timeline.prototype.onenterframe = function (time) {
		// body...
	};

	Timeline.prototype.start = function (interval) {
		var startTime = +new Date(),
			me = this,
			lastTick = 0;
		me.interval = interval || DEFAULT_INTERVAL;
		//this.onenterframe(new Date - startTime);
		me.startTime = startTime;
		me.stop();
		nextTick();

		function nextTick() {
			var now = +new Date();

			me.animationHandler = requestAnimationFrame(nextTick);

			if (now - lastTick >= me.interval) {
				me.onenterframe(now - startTime);
				lastTick = now;
			}
		}
	};

	Timeline.prototype.restart = function () {
		// body...
		var me = this,
			lastTick = 0, interval, startTime;

		if (!me.dur || !me.interval) return;

		interval = me.interval;
		startTime = +new Date() - me.dur;

		me.startTime = startTime;
		me.stop();
		nextTick();

		function nextTick() {
			var now = +new Date();

			me.animationHandler = requestAnimationFrame(nextTick);

			if (now - lastTick >= interval) {
				me.onenterframe(now - startTime);
				lastTick = now;
			}
		}
	};

	Timeline.prototype.stop = function () {
		if (this.startTime) {
			this.dur = +new Date() - this.startTime;
		}
		cancelAnimationFrame(this.animationHandler);
	};

	requestAnimationFrame = (function () {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
				// if all else fails, use setTimeout
			function (callback) {
				return window.setTimeout(callback, 1000 / 60); // shoot for 60 fps
			};
	})();

	// handle multiple browsers for cancelAnimationFrame()
	cancelAnimationFrame = (function () {
		return window.cancelAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.mozCancelAnimationFrame ||
			window.oCancelAnimationFrame ||
			function (id) {
				window.clearTimeout(id);
			};
	})();


	module.exports = Timeline;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var each = __webpack_require__(3);

	var DEBUG = false;

	var myConsole;

	if (DEBUG) {

		myConsole = documentCreateElement("ul", null, {
			cssText: 'position:fixed;_position:absolute;top:0;left:0;z-index:999;border:1px solid #ddd;border-bottom:none;font-family:monospace;background:#000;color:#dadada;height:70%;overflow:scroll;font-size:1.8rem;'
		});

		appendToBody(myConsole);
	}

	function documentCreateElement(tagName, attribute, styles) {
		var element, style;
		element = document.createElement(tagName);
		style = element.style;

		attribute && each(attribute, function (value, key) {
			element[key] = value;
		});

		style && styles && each(styles, function (value, key) {
			style[key] = value;
		});

		return element;
	}

	function appendToBody(element) {
		var body = document.body;
		body.appendChild(element);
	}

	function encodeHTML(str) {
		if (!str || 'string' != typeof str) return str;
		return str.replace(/["'<>\\\/`]/g, function ($0) {
			return '&#' + $0.charCodeAt(0) + ';';
		});
	}

	module.exports = function () {
		if (!DEBUG) return;
		var count, index, html;
		if (!myConsole) return;
		for (index = 0, count = arguments.length, html = []; index < count; index++) {
			html.push(encodeHTML(String(arguments[index])));
		}
		myConsole.appendChild(documentCreateElement("li", {
			innerHTML: html.join(' ')
		}, {
			cssText: "border-bottom:1px solid #ddd"
		}));
	};


/***/ }
/******/ ]);