var _ = require('../util');
var each = _.each;
var format = _.format;
var easing = _.easing;
var Timeline = _.Timeline;

var DIREACTION_UP = 'up';
var DIREACTION_DOWN = 'down';

var MAX_HOUR = 23;

(function (gmu, $, undefined) {
	gmu.define('timePicker', {
		options: {
			listTpl: '<div class="timepicker">' +
			'<ul class="hour hour-hook"></ul>' +
			'<div class="center">' +
			'<ul class="hourmirror hourmirror-hook"></ul>' +
			'</div>' +
			'</div>',
			itemTpl: '<li data-val="#{hour}" class="item #{current}">#{hour}点</li>',
			hours: [],
			currentHour: 0,
			beginHour: 0,
			rate: 0.4,
			step: {
				len: 20,
				deg: 25
			},
			velocity: 500,
			threshold: 15,
			swipeDuration: 2500,
			swipeDefaultStep: 4,
			rollbackDuration: 1000
		},
		_create: function () {
			this.$list = $(this._options.listTpl).appendTo($(document.body));
			this.$hour = $('.hour-hook', this.$list);
			this.$hourmirror = $('.hourmirror-hook', this.$list);

			this.transformKey = $.fx.cssPrefix + 'transform';

			this._bindEvent();
		},
		_init: function () {
			if (!this._options.hours.length) {
				this.hours = this._genDefaultHours();
			}
			this.currentHour = this._options.currentHour || this.hours[0];
			this.beginHour = this._options.beginHour;
			this._fillHours(this.beginHour);
		},
		_bindEvent: function () {

			var me = this;

			var timer = 0;

			var touch = {};
			var start;
			var delta;
			var firstTouch;

			this.$list.on('touchstart', function (e) {
				//alert(1);
				firstTouch = e.touches[0];
				touch.y1 = firstTouch.pageY;

				start = +new Date;

				clearTimeout(timer);
				if (me.$hour.data('isRunning')) {
					me.$hour.data('needStop', true);
					me.$hourmirror.data('needStop', true);
				}

				event.preventDefault();
			}).on('touchmove', function (e) {
				//var runStep = me._getRunStepByMove(data.distance);
				firstTouch = e.touches[0];
				touch.y2 = firstTouch.pageY;

				me._wheelMove(me.$hour, me.$houritems, {
					distance: touch.y2 - touch.y1,
					type: 'normal'
				});
				me._wheelMove(me.$hourmirror, me.$hourmirroritems, {
					distance: touch.y2 - touch.y1,
					type: 'mirror'
				});
			}).on('touchend', function (e) {

				me.$hour.data('yTranslate', me.$hour.data('tmpYTranslate'));
				me.$houritems.each(function () {
					$(this).data('deg', $(this).data('tmpdeg'));
				});
				//
				me.$hourmirror.data('yTranslate', me.$hourmirror.data('tmpYTranslate'));

				me.$hourmirroritems.each(function () {
					$(this).data('deg', $(this).data('tmpdeg'));
				});

				//firstTouch = e.touches[0];
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
			});

		},
		_genDefaultHours: function () {
			var hours = [];
			for (var i = 0; i <= MAX_HOUR; i++) {
				hours.push(i);
			}
			return hours;
		},
		_fillHours: function (begin) {
			var hours = this.hours;
			if (begin !== undefined) {
				hours = hours.slice(hours.indexOf(begin));
			}
			var tpl = [];
			each(hours, function (item) {
				tpl.push(format(this._options.itemTpl, {
					hour: item,
					current: item === this.currentHour ? 'current' : ''
				}));
			}, this);
			this.$houritems = $(tpl.join('')).appendTo(this.$hour);
			this.$hourmirroritems = $(tpl.join('')).appendTo(this.$hourmirror);

			if (this.currentHour !== undefined) {
				this.$hour.data('current', this.currentHour);
				this._initWheel(this.$hour, this.$houritems, this.currentHour, 0, MAX_HOUR, 'normal');
				this._initWheel(this.$hourmirror, this.$hourmirroritems, this.currentHour, 0, MAX_HOUR, 'mirror');
			}
		},
		_getRunStepBySwipe: function (distance) {
			return Math.ceil(distance / 10) * 2
		},
		_initWheel: function ($wheel, $items, current, begin, end, type) {

			var steplen = this._options.step.len;

			var yTranslate = -steplen * current;
			var translateCss = {};
			translateCss[this.transformKey] = 'translateY(' + yTranslate + 'px)';
			$wheel.css(translateCss)
				.data('yTranslate', yTranslate)
				.data('current', current).
				data('begin', begin).
				data('end', end);
			var me = this;
			$items.each(function () {
				var diff = $(this).data('val') - current;
				var deg = diff * me._options.step.deg;
				$(this).data('deg', deg);

				var cssValue = me._getCssByDeg(deg, type);
				me._reSetCss($(this), cssValue);
			});
		},
		_wheelMove: function ($wheel, $items, option) {

			var type = option.type || 'normal';
			//var direction = option.direction;
			var distance = option.distance;

			var steplen = this._options.step.len;
			var stepdeg = this._options.step.deg;

			var begin = $wheel.data('begin');
			var end = $wheel.data('end');
			var minTranslate = begin * steplen;
			var maxTranslate = (end - begin) * steplen;

			var yTranslate = $wheel.data('yTranslate');

			//if (direction === DIREACTION_UP) {
			//	distance = -distance;
			//}

			var tmpYTranslate = $wheel.data('tmpYTranslate');

			if (tmpYTranslate >= minTranslate || tmpYTranslate <= -maxTranslate) {
				var diff;
				if (tmpYTranslate >= minTranslate) {
					diff = -yTranslate - minTranslate;
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
				//var rest = Math.abs(translate % steplen)
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
			var minTranslate = begin * steplen;
			var maxTranslate = (end - begin) * steplen;

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
				if (translate > minTranslate || translate < -maxTranslate) {
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

		},
		_wheelRun: function ($wheel, $items, option, callback) {
			var type = option.type || 'normal';
			var direction = option.direction || DIREACTION_UP;
			var runDistance = option.runDistance;
			var duration = option.duration;
			var easeFn = option.easeFn;
			var easeExtra = option.easeExtra;

			var steplen = this._options.step.len;
			var stepdeg = this._options.step.deg;
			//var yChange = runStep * steplen;
			//if (direction === DIREACTION_UP) {
			//	yChange = -yChange;
			//}
			var degChange = runDistance * stepdeg / steplen;

			//var duration = this._options.swipeDuration;

			var me = this;
			var yTranslate = $wheel.data('tmpYTranslate');

			$wheel.data('isRunning', true);

			var begin = $wheel.data('begin');
			var end = $wheel.data('end');

			var timeline = new Timeline();
			timeline.onenterframe = function (time) {

				var timePercent = Math.min(1, time / duration);

				var needStop = $wheel.data('needStop');
				var timeup = timePercent === 1;
				//stop
				if (timeup || needStop) {
					$items.each(function () {
						var deg;
						if (timeup) {
							deg = $(this).data('deg') + degChange;

						} else {
							deg = $(this).data('tmpdeg');
						}
						deg = Math.round(deg / stepdeg) * stepdeg;
						$(this).data('deg', deg)
							.data('tmpdeg', deg);
						var cssValue = me._getCssByDeg(deg, type);
						me._reSetCss($(this), cssValue);
					});
					if (needStop) {
						$wheel.data('needStop', false);
					}
					if (timeup) {
						translate = yTranslate + runDistance;
						callback && callback();
					} else {
						translate = $wheel.data('tmpYTranslate');
					}
					translate = Math.round(translate / steplen) * steplen;
					//var hasruned = Math.min(1, runPercent) * runStep;
					//var current = $wheel.data('current');
					//if (direction === DIREACTION_UP) {
					//	current = Math.min(current + hasruned, end);
					//} else {
					//	current = Math.max(current - hasruned, begin);
					//}
					
					var translateCss = {};
					translateCss[me.transformKey] = 'translateY(' + translate + 'px)';
					$wheel.data('isRunning', false)
						//.data('current', current)
						.data('yTranslate', translate)
						.data('tmpYTranslate', translate)
						.css(translateCss);

					this.stop();

					return;
				}

				var runPercent;

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
		_reSetCss: function ($el, cssValue) {
			$el[0].style.cssText = '';
			$el.css(cssValue);
		},
		_getEaseExtraByDiff: function (diff) {
			return diff * 0.05;
		}
	});
})
(gmu, gmu.$);