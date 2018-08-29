define(function (require, exports, module){
	var events = require('./events');
	var Fader = function (ctrls){
		this.init(ctrls);
	};
	Fader.prototype = $.extend(events(),{
		init:function (ctrls){
			this.initElements(ctrls);
			this.bindEvents();
		},
		initElements:function (ctrls){
			this.eles = $(ctrls.ele).children();
			this.prevBtn = $(ctrls.prevBtn || $('<a>pre</a>'));
			this.nextBtn = $(ctrls.nextBtn || $('<a>next</a>'));
			this.nav = $(ctrls.nav);
			if(!this.nav.length) this.createNav();
			this.navItems = this.nav.children();
			this.duration = ctrls.duration || 500;
			this.currentCount = ctrls.currentCount || 0;
			this.nextCount = this.currentCount;
			this.autoPlay = ctrls.autoPlay || true;
			this.autoInterval = ctrls.autoInterval || 5000;
			this.currentNavCls = ctrls.currentNavCls || 'on';
			this.event = ctrls.event || 'click';
			this.eles.css({
				position:'absolute',
				left:0,
				top:0,
				display:'none'
			}).eq(0).show();
		},
		bindEvents:function (){
			var me = this;
			if(this.eles.children().length == 1){  
				this.nav.hide();
				return;
			}
			this.prevBtn.on('click',function (){
				me.nextCount = (me.currentCount - 1 + me.eles.length) % me.eles.length;
				me.fadeTo(me.nextCount);
			});
			this.nextBtn.on('click',function (){
				me.nextCount = (me.currentCount + 1) % me.eles.length;
				me.fadeTo(me.nextCount);
			});

			this.navItems.on(this.event,function (){
				if($(this).index() === me.currentCount) return;
				me.nextCount = $(this).index();
				$(this).addClass(me.currentNavCls).siblings().removeClass(me.currentNavCls);
				me.fadeTo(me.nextCount);
			});

			if(this.autoPlay){
				this.autoTimmer = setTimeout(function (){
					if(me.eles.length > 1){
						me.autoNext();
					}
				},me.autoInterval);
			}
		},
		fixDom:function (){
			if(!$.isEmptyObject(this.nav)){
				this.navItems.eq(this.currentCount).addClass(this.currentNavCls);
			}
		},
		fadeTo:function (nextCount){
			var me = this;
			var currentNavItem = this.navItems.eq(this.nextCount);
			currentNavItem.addClass(this.currentNavCls).siblings().removeClass(this.currentNavCls);
			this.eles.filter(':animated').stop().fadeOut('fast',function (){
				me.emit('fadeOutEnd',this);
			});
			this.eles.eq(this.currentCount).fadeOut(this.duration,function (){
				me.emit('fadeOutEnd',this);
			});
			this.currentEle = this.eles.eq(nextCount).fadeIn(this.duration,function (){
				if(me.autoPlay){
					clearTimeout(me.autoTimmer);
					me.autoTimmer = null;
					me.autoTimmer = setTimeout(function (){
						if(me.eles.length > 1){
							me.autoNext();
						}
					},me.autoInterval);
				}
				me.emit('fadeToEnd');
			});
			this.currentCount = nextCount;
			this.emit('fadeTo');
		},
		autoNext:function (){
			var me = this;
			(function(){
				// 不使用trigger点击事件 以免影响其他
				me.nextCount = (me.currentCount + 1) % me.eles.length;
				me.fadeTo(me.nextCount);
				me.autoTimmer = setTimeout(arguments.callee,me.autoInterval);
			})();
		},
		createNav:function (){
			this.nav = $('<ul></ul>');
			for(var i = 0, len = this.eles.length;i < len; i ++){
				this.nav.append($('<a></a>'));
			}
		}
	});

	exports.Fader = Fader;
});