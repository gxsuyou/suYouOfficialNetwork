define(function (require,exports,modules){
	var events = require('./events');

	var Dialog = function (options){
		this.init(options);
	};

	Dialog.prototype = $.extend(events(),{
		init:function (options){
			options = options || {};
			this.pop_switch = $(options.pop_switch);
			this.hasCover = options.hasCover || true;

			var title = options.title || '',
				content = options.content || '<p style="padding-bottom:10px;">系统警告</p>',
				btns = options.btns || [], //[确定.blue] 配置“确定”按钮为蓝色按钮
				width = options.width || '320',
				height = options.height || '';

			var btnstr = '';
			for(var i = 0;i < btns.length ;i++){
				var btn_arr = btns[i].split('.');
				var btn_color = btn_arr.length > 1 ? btn_arr.pop() : '';
				btnstr += '<a class="button_a btn_' + (i + 1) + (btn_color ? ' ' + btn_color + '_button' : '') + '" data-event="btn_' + (i + 1) + '">' + btn_arr.join('.') + '</a>'
			}
			this.$dialog = $('<div class="pop_box" style="display:none;z-index:1000;">\
				<a class="pop_cose" title="关闭">关闭</a>\
				<div class="title_box"' + (title ? '' : ' style="display:none;"') + '>\
					<span class="name">' + title + '</span>\
				</div>\
				<div class="pop_content" style="width:' + width + 'px;' + (height ? 'height:' + height + 'px;' : '') + '">\
				</div>\
				<div class="pop_button fixed"' + (btns.length ? '' : ' style="display:none;"') + '>' + btnstr + '</div>\
			</div>').appendTo('body');

			this.$title = this.$dialog.find('.title_box .name');
			this.$content = this.$dialog.find('.pop_content').append(content);

			this.cover = $.extend(events(),{
				$ele:$('<div style="display:none;position:absolute;left:0;top:0;background:#000;opacity:.4;filter:alpha(opacity=40);z-index:999;width:' + $(document).width() + 'px;height:' + $(document).height() + 'px;"></div>').appendTo('body'),
				show:function (){
					this.$ele.show();
					this.emit('show');
				},
				hide:function (){
					this.$ele.hide();
					this.emit('hide');
				},
				reset:function (css){
					css = css || {};
					this.$ele.width($(document).width()).height($(document).height()).css(css);
				}
			});
			this.bindEvents();
		},
		bindEvents:function (){
			var _this = this;
			if(this.pop_switch.length){
				this.pop_switch.on('click',function (){
					_this.show();
				});
			}
			this.$dialog.on('click','.pop_button a',function (){
				var event = $(this).attr('data-event');
				_this.emit(event,this);
			}).on('click','.pop_cose,.pop_button a:last-child,.pop_button a:first-child',function (){
				_this.hide();
			});
			var resizeTimer;
			$(window).on('resize',function (){
				if(_this.hasCover){
					_this.cover.reset();
				}
				if(resizeTimer){
					clearTimeout(resizeTimer);
				}
				resizeTimer = setTimeout(function (){
					_this.setMidPos();
				},100);
			});
		},
		show:function (){
			this.$dialog.show();
			if(this.hasCover){
				this.cover.reset();
			}
			this.setMidPos();
			if(this.hasCover) this.cover.show();
			this.emit('show');
		},
		hide:function (){
			this.$dialog.hide();
			if(this.hasCover) this.cover.hide();
			this.emit('hide');
		},
		update:function (options) {
			if(options.title) this.$title.html(options.title);
			if(options.content) this.$content.empty().append(options.content);
			if(options.width) this.$content.width(options.width);
			if(options.height) this.$content.height(options.height);
		},
		setMidPos:function (){
			var $w = $(window);

			this.$dialog.css({
				position:'absolute',
				top:$w.scrollTop() + $w.height() / 2 - this.$dialog.outerHeight() / 2,
				left:$w.scrollLeft() + $w.width() / 2 - this.$dialog.outerWidth() / 2
			});
		}
	});
	exports.Dialog = Dialog;
});