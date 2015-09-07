var _ = require('../util');
var each = _.each;
var format = _.format;
var easing = _.easing;
var Timeline = _.Timeline;
var date = _.date;

var DIREACTION_UP = 'up';
var DIREACTION_DOWN = 'down';


(function (gmu, $, undefined) {
	gmu.define('timePicker', {
		options: {
			listTpl: '<div class="timepicker">' +
			'<div class="wheel">' +
			'<ul class="day day-hook"></ul>' +
			'<ul class="hour hour-hook"></ul>' +
			'<ul class="minute minute-hook"></ul>' +
			'</div>' +
			'<div class="center">' +
			'<ul class="daymirror daymirror-hook"></ul>' +
			'<ul class="hourmirror hourmirror-hook"></ul>' +
			'<ul class="minutemirror minutemirror-hook"></ul>' +
			'</div>' +
			'</div>',
			itemTpl: '<li data-val="#{val}" data-index="#{index}" class="item #{current}">#{text}</li>',
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
			day: {
				step: 1,
				len: 7,
				filter: ['今天', '明天', '后天'],
				format: 'M月d日'
			},
			delay: date.MINUTE_TIMESTAMP * 15,
			selectTime: +new Date,
			rate: 0.4,
			step: {
				len: 20,
				deg: 25
			},
			velocity: 300,
			threshold: 15,
			swipeDuration: 2500,
			swipeDefaultStep: 4,
			rollbackDuration: 1000
		},
		_create: function () {
			this.$list = $(this._options.listTpl).appendTo($(document.body));

			this.$day = $('.day-hook', this.$list);
			this.$daymirror = $('.daymirror-hook', this.$list);

			this.$hour = $('.hour-hook', this.$list);
			this.$hourmirror = $('.hourmirror-hook', this.$list);

			this.$minute = $('.minute-hook', this.$list);
			this.$minutemirror = $('.minutemirror-hook', this.$list);

			this.transformKey = $.fx.cssPrefix + 'transform';

			this._bindEvent();
		},
		_init: function () {
			this.current = new Date(+new Date + this._options.delay);

			this.selectedDate = this._options.selectedDate || this.current;

			this._initDays();

			this._initHours();

			this._initMinutes();

		},
		_initDays: function () {
			this.days = this._genDays();
			var current = (+date.getZeroDate(this.selectedDate) - +date.getZeroDate(this.current)) / date.DAY_TIMESTAMP;
			var begin = 0;
			var end = this.days.length - 1;
			this._fillDays(begin, end, current);
		},
		_genDays: function () {
			var days = [];
			var dayConf = this._options.day;
			var zeroTimestamp = +date.getZeroDate(this.current);
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
			this.$dayitems = $(strTpl).appendTo(this.$day);
			this.$daymirroritems = $(strTpl).appendTo(this.$daymirror);

			this.$day.data('current', current);
			this._initWheel(this.$day, this.$dayitems, current, begin, end, 'normal');
			this._initWheel(this.$daymirror, this.$daymirroritems, current, begin, end, 'mirror');

		},
		_initHours: function () {
			this.hours = this._genHours();
			var hourConf = this._options.hour;
			var current = Math.ceil(this.selectedDate.getHours() / hourConf.step);
			var begin = Math.ceil(this.current.getHours() / hourConf.step);
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
			this.$houritems = $(strTpl).appendTo(this.$hour);
			this.$hourmirroritems = $(strTpl).appendTo(this.$hourmirror);

			this.$hour.data('current', current);
			this._initWheel(this.$hour, this.$houritems, current, begin, end, 'normal');
			this._initWheel(this.$hourmirror, this.$hourmirroritems, current, begin, end, 'mirror');
		},
		_initMinutes: function () {
			this.minutes = this._genMinutes();
			var minuteConf = this._options.minute;
			var current = Math.ceil(this.selectedDate.getMinutes() / minuteConf.step);
			var begin = Math.ceil(this.current.getMinutes() / minuteConf.step);
			var end = this.minutes.length - 1;
			this._fillMinutes(begin, end, current);
		},
		_genMinutes: function () {
			var minutes = [];
			var minuteConf = this._options.minute;
			for (var i = minuteConf.min; i <= minuteConf.max; i += minuteConf.step) {
				minutes.push({
					val: i,
					text: i + '分'
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
			this.$minuteitems = $(strTpl).appendTo(this.$minute);
			this.$minutemirroritems = $(strTpl).appendTo(this.$minutemirror);

			this.$minute.data('current', current);

			this._initWheel(this.$minute, this.$minuteitems, current, begin, end, 'normal');
			this._initWheel(this.$minutemirror, this.$minutemirroritems, current, begin, end, 'mirror');

		},
		_initWheel: function ($wheel, $items, current, begin, end, type) {

			var steplen = this._options.step.len;

			var yTranslate = -steplen * (current - begin);
			var translateCss = {};
			translateCss[this.transformKey] = 'translateY(' + yTranslate + 'px)';
			$wheel.css(translateCss)
				.data('yTranslate', yTranslate)
				.data('current', current).
				data('begin', begin).
				data('end', end);
			var me = this;
			$items.each(function () {
				var diff = $(this).data('index') - current;
				var deg = diff * me._options.step.deg;
				$(this).data('deg', deg);

				var cssValue = me._getCssByDeg(deg, type);
				me._reSetCss($(this), cssValue);
			});
		},
		_bindEvent: function () {

			this.$list.on('touchstart', function (e) {
				return false;
			});

			this._bindDayEvent();

			this._bindHourEvent();

			this._bindMinuteEvent();

		},
		_bindDayEvent: function () {
			var me = this;
			var timer = 0;
			var touch = {};
			var start;
			var delta;
			var firstTouch;

			this.$day.on('touchstart', onTouchStart).
				on('touchmove', onTouchMove).
				on('touchend', onTouchEnd);

			this.$daymirror.on('touchstart', onTouchStart).
				on('touchmove', onTouchMove).
				on('touchend', onTouchEnd);

			function onTouchStart(e) {
				firstTouch = e.touches[0];
				touch.y1 = firstTouch.pageY;

				start = +new Date;

				clearTimeout(timer);
				if (me.$day.data('isRunning')) {
					me.$day.data('needStop', true);
					me.$daymirror.data('needStop', true);
				}

				if (me.$day.data('tmpYTranslate') || me.$day.data('tmpYTranslate') === 0) {

					me.$day.data('yTranslate', me.$day.data('tmpYTranslate'));
					me.$dayitems.each(function () {
						$(this).data('deg', $(this).data('tmpdeg'));
					});

					me.$daymirror.data('yTranslate', me.$daymirror.data('tmpYTranslate'));

					me.$daymirroritems.each(function () {
						$(this).data('deg', $(this).data('tmpdeg'));
					});

				}

				event.preventDefault();
			}

			function onTouchMove(e) {
				firstTouch = e.touches[0];
				touch.y2 = firstTouch.pageY;
				var distance = touch.y2 - touch.y1;

				me._wheelMove(me.$day, me.$dayitems, {
					distance: distance,
					type: 'normal'
				});
				me._wheelMove(me.$daymirror, me.$daymirroritems, {
					distance: distance,
					type: 'mirror'
				});
			}

			function onTouchEnd(e) {
				touch.y2 = firstTouch.pageY;

				var duration = +new Date - start;
				delta = touch.y2 - touch.y1;

				var direction = delta > 0 ? DIREACTION_DOWN : DIREACTION_UP;

				delta = Math.abs(delta);

				if (duration < me._options.velocity && delta > me._options.threshold) {
					var runStep = me._getRunStepBySwipe(delta);

					me._wheelSwipe(me.$day, me.$dayitems, {
						direction: direction,
						runStep: runStep,
						delta: delta,
						type: 'normal'
					});
					me._wheelSwipe(me.$daymirror, me.$daymirroritems, {
						direction: direction,
						runStep: runStep,
						delta: delta,
						type: 'mirror'
					});
				}
				else {
					clearTimeout(timer);
					timer = setTimeout(function () {
						if (!me.$day.data('isRunning')) {
							me._wheelAdjust(me.$day, me.$dayitems, {
								type: 'normal'
							});
							me._wheelAdjust(me.$daymirror, me.$daymirroritems, {
								type: 'mirror'
							});
						}
					}, 20);
				}
			}
		},
		_bindHourEvent: function () {
			var me = this;
			var timer = 0;
			var touch = {};
			var start;
			var delta;
			var firstTouch;

			this.$hour.on('touchstart', onTouchStart).
				on('touchmove', onTouchMove).
				on('touchend', onTouchEnd);

			this.$hourmirror.on('touchstart', onTouchStart).
				on('touchmove', onTouchMove).
				on('touchend', onTouchEnd);

			function onTouchStart(e) {
				firstTouch = e.touches[0];
				touch.y1 = firstTouch.pageY;

				start = +new Date;

				clearTimeout(timer);
				if (me.$hour.data('isRunning')) {
					me.$hour.data('needStop', true);
					me.$hourmirror.data('needStop', true);
				}

				if (me.$hour.data('tmpYTranslate') || me.$hour.data('tmpYTranslate') === 0) {

					me.$hour.data('yTranslate', me.$hour.data('tmpYTranslate'));
					me.$houritems.each(function () {
						$(this).data('deg', $(this).data('tmpdeg'));
					});

					me.$hourmirror.data('yTranslate', me.$hourmirror.data('tmpYTranslate'));

					me.$hourmirroritems.each(function () {
						$(this).data('deg', $(this).data('tmpdeg'));
					});

				}

				event.preventDefault();
			}

			function onTouchMove(e) {
				firstTouch = e.touches[0];
				touch.y2 = firstTouch.pageY;
				var distance = touch.y2 - touch.y1;

				me._wheelMove(me.$hour, me.$houritems, {
					distance: distance,
					type: 'normal'
				});
				me._wheelMove(me.$hourmirror, me.$hourmirroritems, {
					distance: distance,
					type: 'mirror'
				});
			}

			function onTouchEnd(e) {
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
						type: 'normal'
					});
					me._wheelSwipe(me.$hourmirror, me.$hourmirroritems, {
						direction: direction,
						runStep: runStep,
						delta: delta,
						type: 'mirror'
					});
				}
				else {
					clearTimeout(timer);
					timer = setTimeout(function () {
						if (!me.$hour.data('isRunning')) {
							me._wheelAdjust(me.$hour, me.$houritems, {
								type: 'normal'
							});
							me._wheelAdjust(me.$hourmirror, me.$hourmirroritems, {
								type: 'mirror'
							});
						}
					}, 20);
				}
			}
		},
		_bindMinuteEvent: function () {
			var me = this;
			var timer = 0;
			var touch = {};
			var start;
			var delta;
			var firstTouch;

			this.$minute.on('touchstart', onTouchStart).
				on('touchmove', onTouchMove).
				on('touchend', onTouchEnd);

			this.$minutemirror.on('touchstart', onTouchStart).
				on('touchmove', onTouchMove).
				on('touchend', onTouchEnd);

			function onTouchStart(e) {
				firstTouch = e.touches[0];
				touch.y1 = firstTouch.pageY;

				start = +new Date;

				clearTimeout(timer);
				if (me.$minute.data('isRunning')) {
					me.$minute.data('needStop', true);
					me.$minutemirror.data('needStop', true);
				}

				if (me.$minute.data('tmpYTranslate') || me.$minute.data('tmpYTranslate') === 0) {

					me.$minute.data('yTranslate', me.$minute.data('tmpYTranslate'));
					me.$minuteitems.each(function () {
						$(this).data('deg', $(this).data('tmpdeg'));
					});

					me.$minutemirror.data('yTranslate', me.$minutemirror.data('tmpYTranslate'));

					me.$minutemirroritems.each(function () {
						$(this).data('deg', $(this).data('tmpdeg'));
					});

				}

				event.preventDefault();
			}

			function onTouchMove(e) {
				firstTouch = e.touches[0];
				touch.y2 = firstTouch.pageY;
				var distance = touch.y2 - touch.y1;

				me._wheelMove(me.$minute, me.$minuteitems, {
					distance: distance,
					type: 'normal'
				});
				me._wheelMove(me.$minutemirror, me.$minutemirroritems, {
					distance: distance,
					type: 'mirror'
				});
			}

			function onTouchEnd(e) {
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
						type: 'normal'
					});
					me._wheelSwipe(me.$minutemirror, me.$minutemirroritems, {
						direction: direction,
						runStep: runStep,
						delta: delta,
						type: 'mirror'
					});
				}
				else {
					clearTimeout(timer);
					timer = setTimeout(function () {
						if (!me.$minute.data('isRunning')) {
							me._wheelAdjust(me.$minute, me.$minuteitems, {
								type: 'normal'
							});
							me._wheelAdjust(me.$minutemirror, me.$minutemirroritems, {
								type: 'mirror'
							});
						}
					}, 20);
				}
			}
		},
		_wheelMove: function ($wheel, $items, option) {

			var type = option.type || 'normal';
			//var direction = option.direction;
			var distance = option.distance;

			var steplen = this._options.step.len;
			var stepdeg = this._options.step.deg;

			var begin = $wheel.data('begin');
			var end = $wheel.data('end');
			//var minTranslate = begin * steplen;
			var maxTranslate = (end - begin) * steplen;

			var yTranslate = $wheel.data('yTranslate');

			var tmpYTranslate = $wheel.data('tmpYTranslate');

			if (tmpYTranslate >= 0 || tmpYTranslate <= -maxTranslate) {
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

			var degChange = distance * stepdeg / steplen;

			var me = this;
			$items.each(function () {
				var deg = $(this).data('deg') + degChange;
				$(this).data('tmpdeg', deg);
				var cssValue = me._getCssByDeg(deg, type);
				me._reSetCss($(this), cssValue);
			});

		},
		_wheelAdjust: function ($wheel, $items, option, callback) {

			var type = option.type || 'normal';

			var translate = $wheel.data('tmpYTranslate');

			if (!translate && translate !== 0)
				return;

			//$wheel.data('tmpYTranslate', '');
			var steplen = this._options.step.len;

			var begin = $wheel.data('begin');
			var end = $wheel.data('end');
			var maxTranslate = (end - begin) * steplen;

			var targetTranslate;


			if (translate > 0) {
				targetTranslate = 0;
			} else if (translate < -maxTranslate) {
				targetTranslate = -maxTranslate;
			} else {
				if (translate % steplen === 0)
					return;

				targetTranslate = Math.floor(translate / steplen) * steplen + ( Math.abs(translate % steplen) <= 10 ? steplen : 0);
			}

			var direction;

			if (targetTranslate > translate) {
				direction = DIREACTION_DOWN;

			} else {
				direction = DIREACTION_UP;

			}
			var runDistance = targetTranslate - translate;

			$items.each(function () {
				var deg = $(this).data('tmpdeg');
				$(this).data('deg', deg);
			});

			var runOption = {
				type: type,
				direction: direction,
				runDistance: runDistance,
				duration: 50,
				easeFn: easing.easeOutQuad
			};

			this._wheelRun($wheel, $items, runOption, callback);
		},
		_wheelSwipe: function ($wheel, $items, option, callback) {

			var type = option.type || 'normal';

			var direction = option.direction;
			var runStep = option.runStep;
			var delta = option.delta;
			//var current = $wheel.data('current');
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

			$items.each(function () {
				var deg = $(this).data('tmpdeg');
				$(this).data('deg', deg);
			});

			var easeExtra;
			var duration;
			var easeFn;
			if (diff > 0) {
				duration = this._options.rollbackDuration;
				runDistance = direction === DIREACTION_DOWN ? -translate : -translate - maxTranslate;
				//alert(runDistance);
				if (translate > 0 || translate < -maxTranslate) {
					easeFn = easing.easeInBack;
				} else {
					easeFn = easing.easeOutBack;
				}
				easeExtra = this._getEaseExtraByDiff(diff);
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

		}
		,
		_wheelRun: function ($wheel, $items, option, callback) {
			var me = this;

			var type = option.type || 'normal';
			var direction = option.direction || DIREACTION_UP;
			var runDistance = option.runDistance;
			var duration = option.duration;
			var easeFn = option.easeFn;
			var easeExtra = option.easeExtra;

			var steplen = this._options.step.len;
			var stepdeg = this._options.step.deg;

			var degChange = runDistance * stepdeg / steplen;

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
				var timePercent = Math.min(1, time / duration);
				var timeup = timePercent === 1;
				//stop
				if (timeup) {
					$items.each(function () {
						var deg = $(this).data('deg') + degChange;
						deg = Math.round(deg / stepdeg) * stepdeg;
						$(this).data('tmpdeg', deg);
						var cssValue = me._getCssByDeg(deg, type);
						me._reSetCss($(this), cssValue);
					});

					var translate = yTranslate + runDistance;
					translate = Math.round(translate / steplen) * steplen;

					var translateCss = {};
					translateCss[me.transformKey] = 'translateY(' + translate + 'px)';
					$wheel.data('isRunning', false)
						//.data('current', current)
						//.data('yTranslate', translate)
						.data('tmpYTranslate', translate)
						.css(translateCss);

					this.stop();
					callback && callback();
					return;
				}

				var runPercent = timePercent;

				if (easeFn) {
					runPercent = easeFn(timePercent, duration * timePercent, 0, 1, duration, easeExtra);
				}

				$items.each(function () {
					var deg = $(this).data('deg');
					if (runPercent > 1) {
						var extra = (runPercent - 1) * stepdeg;
						deg += degChange + (direction === DIREACTION_UP ? -extra : extra);
					} else {
						deg += degChange * runPercent;
					}
					$(this).data('tmpdeg', deg);
					var cssValue = me._getCssByDeg(deg, type);
					me._reSetCss($(this), cssValue);
				});

				var translate;
				if (runPercent > 1) {
					var extra = (runPercent - 1) * steplen;
					translate = yTranslate + runDistance + (direction === DIREACTION_UP ? -extra : extra);
				} else {
					translate = yTranslate + runDistance * runPercent;
				}

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
		_getCssByDeg: function (deg, type) {
			var cssValue = {};

			var yTranslate;

			if (Math.abs(deg) <= 90) {
				yTranslate = deg * this._options.rate + 'px';
				cssValue['visibility'] = 'visible';
			} else {
				cssValue['visibility'] = 'hidden';
			}

			cssValue[this.transformKey] = 'rotateX(' + deg + 'deg) translateY(' + yTranslate + ')';

			var color;

			if (type === 'mirror') {
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
			return diff * 0.05;
		}
	});
})
(gmu, gmu.$);