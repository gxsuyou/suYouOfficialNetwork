define(function (require,exports,module){
	var events = require('./events');
	exports.publicInterAction = {
		init:function (options){
			options = options || {};
			if(!options.no_drop_menu) this.ui_drop_menu();
			if(!options.no_input) this.ui_input();
			if(!options.no_tabs) this.ui_tabs();
			if(!options.no_radio) this.ui_radio();
			if(!options.no_multiselect) this.ui_multiselect();
			if(!options.no_checkbox) this.ui_checkbox();
			if(!options.no_backtop) this.ui_backtop();
		},
		ui_drop_menu:function (){ // 通用二级下拉菜单实现
			$('body').delegate('.drop_menu','mouseover',function (){
				$(this).find('.drop_box').show();
				$(this).addClass('current_drop_menu');
				if(this.mouseleavTimer){
					clearTimeout(this.mouseleavTimer);
					this.mouseleavTimer = null;	
				}
			}).delegate('.drop_menu','mouseleave',function (){
				var self = this;
				// 下拉菜单
				if($(this).is('[data-nodelay]')){
					$(this).removeClass('current_drop_menu');
					$(this).find('.drop_box').hide();
					return;
				}
				this.mouseleavTimer = setTimeout(function (){
					$(self).removeClass('current_drop_menu');
					$(self).find('.drop_box').hide();
				},260);
			}).delegate('.drop_box','mouseleave',function (){
				$(this).hide();
			});
			this.ui_drop_menu = function (){};
		},
		ui_input:function (){ // 通用表单获得焦点失去焦点
			var inputs = 'input,input[type="password"],textarea';
			$('body').delegate(inputs,'focus blur keyup',function (){
				if(this.value){
					$(this).css('font-weight','bold').siblings('.input_tip').hide();
				} else {
					$(this).css('font-weight','normal').siblings('.input_tip').show();
				}
			}).delegate(inputs,'focus',function (){
				$(this).parent().addClass('focus_box');
			}).delegate(inputs,'blur',function (){
				$(this).parent().removeClass('focus_box');
			}).delegate('.input_tip','click',function (){
				$(this).siblings(inputs).trigger('focus');
			});
			$(inputs).each(function (){
				var type = $(this).attr('type')
				if(type === 'text' || type === 'password' || type === undefined){
					if(this.value) $(this).css('font-weight','bold').siblings('.input_tip').hide();
				}
			});
			$('textarea').each(function (){
				if(this.value) $(this).css('font-weight','bold').siblings('.input_tip').hide();
			});
			this.ui_input = function (){};
		},
		ui_radio:function (){
			var radios = {};
			$('[data-radio]').each(function (){
				var name	= $(this).attr('data-radio');
				var lastTime= 0;
				var radioBox = $.extend(events(),{
					value:'',
					isActive:false,
					state:'show',
					$box:$(this),
					$items:$(this).find('.option_list:not(.custom_box)'),
					$selectItem:$(this).find('.fui_radio_checked').parents('.option_list'),
					$showAllBtn:$('<li class="reselect_menu_box" style="display: block;"><a class="reselect_menu">重新选择</a></li>'),
					bindEvents:function (){
						var self = this;

						this.$box.on('click','.option_list',function (e){
							//防止快速重复响应事件
							var nowTime	= new Date();
							if (nowTime - lastTime < 100) return;
							lastTime	= nowTime;

							self.$selectedItem = $(this);
							self.select();
							// e.stopPropagation();
						});
						this.$showAllBtn.on('click',function (e){
							self.showAll();
							// e.stopPropagation();
						});
						this.selectCounter = 0;
						this.on('select',function (){
							if(self.selectCounter ++ > 0){
								this.isActive = true;
							}
						});
						$('html,body').on('click',function (e){
							if($(e.target).parents('[data-radio]').is('[data-radio="' + self.$box.attr('data-radio') + '"]') || e.target === self.$showAllBtn[0] || e.target === self.$showAllBtn.find('.reselect_menu')[0])
								return;
							if(self.isActive)
								self.hideOther();
						});
					},
					reset:function (){
						this.$box.find('.option_list:not(.custom_box)').each(function (){
							$(this).removeClass('fui_checked_box').find('.fui_radio').removeClass('fui_radio_checked');
							$(this).find('.fui_radio').removeClass('fui_radio_checked');
						});
						this.value = '';
						this.$selectedItem = '';
						this.emit('reset');
					},
					select:function (){
						this.$selectedItem.addClass('fui_checked_box').siblings('.fui_checked_box').removeClass('fui_checked_box').find('.fui_radio').removeClass('fui_radio_checked');
						this.$selectedItem.find('.fui_radio').addClass('fui_radio_checked');
						this.value = this.$selectedItem.find('[type="radio"]').val();
						this.emit('select');
					},
					showAll:function (){
						this.$box.children().show();
						this.$showAllBtn.remove();
						this.state = 'show';
						this.emit('showAll');
					},
					hideOther:function (){
						if(this.state === 'hide') return;
						this.hideAnimate();
						this.state = 'hide';
						this.isActive = false;
						this.emit('hideOther');
					},
					hideAnimate:function (){
						if(!this.$box.is(':visible')) return;
						var self	= this;
						var boxPos	= this.$box.offset();
						var animateHtml = $('<div style="z-index:999;border:1px solid #ccc;position: absolute;top:' + boxPos.top + 'px;left:' + boxPos.left + 'px;width:' + this.$box.width() + 'px;height:' + this.$box.height() + 'px;"></div>');
						animateHtml.appendTo('body');
						animateHtml.animate({width:this.$selectedItem.width(),height:this.$selectedItem.height()},function (){
							$(this).remove();
							self.$box.children().hide();
							self.$showAllBtn.appendTo(self.$box).show();
							self.$showAllBtn.on('click',function (e){
								self.showAll();
							});

							if(self.$selectedItem && self.$selectedItem.length) self.$selectedItem.show();
						});
					}
				});
				radioBox.bindEvents();
				radios[name] = radioBox;
			});
			this.radios = radios;
			this.ui_radio = function (){};
		},
		ui_multiselect:function (){
			var multis = {};
			$('[data-multiselect]').each(function (){
				var name	= $(this).attr('data-multiselect');
				var lastTime= 0;
				var multiSelectBox = $.extend(events(),{
					value:'',
					isActive:false,
					$box:$(this),
					$items:$(this).find('.option_list'),
					$selectItem:$(this).find('.fui_checkbox_checked').parents('.option_list'),
					$showAllBtn:$('<li class="reselect_menu_box" style="display: block;"><a class="reselect_menu">重新选择</a></li>'),
					bindEvents:function (){
						var self = this;

						this.$box.on('click','.option_list',function (e){
							//防止快速重复响应事件
							var nowTime	= new Date();
							if (nowTime - lastTime < 100) return;
							lastTime	= nowTime;

							self.$selectedItem = $(this);
							self.select();
							// e.stopPropagation();
						});
						this.$showAllBtn.on('click',function (e){
							self.showAll();
							// e.stopPropagation();
						});
						this.selectCounter = 0;
						this.on('select',function (){
							if(self.selectCounter ++ > 0){
								this.isActive = true;
							}
						});

						$('html,body').on('click',function (e){
							if($(e.target).parents('[data-multiselect]').is('[data-multiselect="' + self.$box.attr('data-multiselect') + '"]') || e.target === self.$showAllBtn[0] || e.target === self.$showAllBtn.find('.reselect_menu')[0])
								return;
							if(self.isActive)
								self.hideOther();
						});
					},
					reset:function (){
						this.$box.find('.option_list').each(function (){
							$(this).removeClass('fui_checked_box').find('.fui_checkbox').removeClass('fui_checkbox_checked');
							$(this).find('.fui_checkbox').removeClass('fui_checkbox_checked');
						});
						this.value			= '';
						this.$selectedItem	= '';
						this.emit('reset');
					},
					select:function (){
						if($(this.$selectedItem.find('.fui_checkbox')).is('.fui_checkbox_checked')){
							this.$selectedItem.find('input').removeAttr('checked');
							this.$selectedItem.removeClass('fui_checked_box');
							this.$selectedItem.find('.fui_checkbox').removeClass('fui_checkbox_checked');
						} else {
							this.$selectedItem.find('input').attr('checked','checked');
							this.$selectedItem.addClass('fui_checked_box');
							this.$selectedItem.find('.fui_checkbox').addClass('fui_checkbox_checked');
						}

						this.value	= this.$selectedItem.find('[type="checkbox"]').val();
						this.emit('select');
					},
					showAll:function (){
						this.$box.children().show();
						this.$showAllBtn.remove();
						this.emit('showAll');
					},
					hideOther:function (){
						this.hideAnimate();
						this.isActive = false;
						this.emit('hideOther');
					},
					hideAnimate:function (){
						if(!this.$box.is(':visible')) return;
						var self	= this;
						var boxPos	= this.$box.offset();
						var animateHtml = $('<div style="z-index:999;border:1px solid #ccc;position: absolute;top:' + boxPos.top + 'px;left:' + boxPos.left + 'px;width:' + this.$box.width() + 'px;height:' + this.$box.height() + 'px;"></div>');
						animateHtml.appendTo('body');

						animateHtml.animate({width:this.$selectedItem.width(),height:this.$selectedItem.height()},function (){
							$(this).remove();
							self.$box.children().hide();
							self.$showAllBtn.appendTo(self.$box).show();
							self.$showAllBtn.on('click',function (e){
								self.showAll();
							});

							if(self.$selectedItem && self.$selectedItem.length) self.$box.find('.fui_checked_box').show();
						});
					}
				});
				multiSelectBox.bindEvents();
				multis[name] = multiSelectBox;
			});
			this.multis = multis;
			this.ui_multiselect = function (){};
		},
		ui_checkbox:function (){
			$.fn.fui_checkbox_check = function (){
				if(!this.is('.fui_checkbox')) return;
				$('#' + this.attr('data-for')).attr('checked','checked');
				this.addClass('fui_checkbox_checked');
			}
			$.fn.fui_checkbox_uncheck = function (){
				if(!this.is('.fui_checkbox')) return;
				$('#' + this.attr('data-for')).removeAttr('checked');
				this.removeClass('fui_checkbox_checked');
			}

			$('.fui_checkbox').on('click',function (){
				if($(this).is('.fui_checkbox_checked')){
					$(this).fui_checkbox_uncheck();
				} else {
					$(this).fui_checkbox_check();
				}
			});
			$('body').on('click','label[data-fui-for]',function (){
				$('#' + $(this).attr('data-fui-for')).trigger('click');
			});
		},
		ui_backtop:function (){// 返回顶部按钮
			var $bp = $('.right_pendant'),$bt = $bp.find('.back_top');
			$bp.show();
			$bt.on('click',function (){
				$('body,html').animate({scrollTop:0},200);
			});
			var st = 0;
			$(window).on('scroll',function (){
				if($(window).scrollTop() === 0){
					$bt.slideUp();
					st = 0;
				} else {
					if(st === 0) $bt.slideDown();
					st = 1;
				}
			}).trigger('scroll');
		},
		ui_tabs:function (){
			// 小tab组件。实现更灵活的配置。
			/*
				tab按钮容器打上标记 data-tab data-tabname="{tabname}"
				约定tab项 class="{tabname}_tab"
				约定tab内容 class="{tabname}_tabcontent"
				动画块 data-tabIndex="{tabname}"
				支持事件机制
				对外暴露tab对象
			*/
			var tabs = {};

			$('[data-tab]').each(function (){
				var self = this,tabName = $(this).attr('data-tab') || $(this).attr('data-tabname'),tLeft = $(this).offset().left;

				var tabObj = $.extend(events(),{
					tabName : tabName,
					tabEvent:$(this).attr('data-event') || 'click',
					$tabs : $('.' + tabName + '_tab'),
					$tabContents : $('.' + tabName + '_tabcontent'),
					$tabIndex : $('[data-tabindex="' + tabName + '"]'),
					tabTo : function (index){
						index = Number(index);
						this.$currentTab = this.$tabs.eq(index);
						this.$tabContents.hide().eq(index).show();

						this.$tabs.removeClass('current');
						this.$currentTab.addClass('current');
						tLeft = $(self).offset().left;
						left = this.$currentTab.offset().left - tLeft;
						width = this.$currentTab.outerWidth();

						if(this.$tabIndex.length)
							this.$tabIndex.stop().animate({left:left,width:width},'fast',function (){
								$(this).css({overflow:'visible'});
							});

						this.index = index;
						this.emit('tabTo');
						this.ready['tabTo'] = true;
					},
					bindEvents:function (){
						var self = this;
						this.$tabs.on(this.tabEvent,function (){
							self.tabTo(self.$tabs.index(this));
						});
					},
					updateTabIndex:function (){
						this.$tabIndex.animate({
							left:this.$currentTab.offset().left - $(self).offset().left,
							width:this.$currentTab.outerWidth()
						},'fast');
					},
					ready:{}
				});
				tabObj.bindEvents();
				if(!$(this).attr('data-nodefaluttab')) tabObj.tabTo($(this).attr('data-currentIndex') || 0);
				tabObj.on('newListener',function (event,callback){
					if(this.ready[event]) callback.call(this);
				});
				tabs[tabName] = tabObj;
			});
			// url定位tab位置
			(function (){
				var search = window.location.hash.replace('#','');
				if(!search || !/^tab_\w+_\d+/.test(search)) return;
				var searchArr = search.split('_'),
					tabname = searchArr[1],index = Number(searchArr[2]);
				if(tabs[tabname]) tabs[tabname].tabTo(index);
			})();
			
			this.tabs = tabs;
		}
	}
});