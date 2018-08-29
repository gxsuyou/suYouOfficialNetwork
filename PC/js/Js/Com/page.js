define(function (require, exports, module){
	var events = require('./events') || window.events;

	var Page = function(options) {
		this.init(options);
	}
	Page.prototype = $.extend(events(),{
		init: function(options) {
			this.initElements(options);
			this.bindEvents();
			this.entrance(options); //删掉这一句可自主选择调用时机
		},
		initElements: function(options) {
			this.$wrapper		= options.$Page || $('[data-fn=paging]') || $('<div></div>');
			//格式：上一页 ... first 1 2 3 4 5 last ... 下一页 pagesBoard input toBtn
			this.$prevBtn		= options.$prevBtn || $('<a data-role="prev">上一页</a>') /*.appendTo(this.$wrapper)*/ ;
			this.$firstPage		= options.$firstPage || $('<a data-role="page" data-page="1">首页</a>') /*.appendTo(this.$wrapper)*/ ;
			this.$prevEllipsis	= options.$prevEllipsis || $('<span data-role="prevEllipsis" style="display:none;">...</span>').hide() /*.appendTo(this.$wrapper)*/ ;

			this.$pagesContainer= options.$pagesContainer || $('<div data-role="pagesContainer"></div>') /*.appendTo(this.$wrapper)*/ ;

			this.$nextEllipsis	= options.$nextEllipsis || $('<span data-role="nextEllipsis" style="display:none;">...</span>').hide() /*.appendTo(this.$wrapper)*/ ;
			this.$lastPage		= options.$lastPage || $('<a data-role="page" data-page="">尾页</a>') /*.appendTo(this.$wrapper)*/ ;
			this.$nextBtn		= options.$nextBtn || $('<a data-role="next">下一页</a>') /*.appendTo(this.$wrapper)*/ ;

			//快速选页
			this.$pagesBoard	= options.$pagesBoard || $('<span data-role="pagesBoard"></span>') /*.appendTo(this.$wrapper)*/ ;
			this.$fastIn		= options.$fastIn || $('<span>到第<input data-role="fastInput" type="text">页</span>') /*.appendTo(this.$wrapper)*/ ;
			this.$fastInput		= options.$fastInput || this.$fastIn.find('input') || $('<input data-role="fastInput" type="text">页</span>');
			this.$fastBtn		= options.$fastBtn || $('<a data-role="fastBtn">确定</a>') /*.appendTo(this.$wrapper)*/ ;

			//other
			this.perPage		= Number(options.perPage) || 1; //每页多少项
			this.visiblePages	= Number(options.visiblePages) || 5; //可视的页数  

			this.currentCls		= options.currentCls || 'selected'; //当前页的class
			this.disableCls		= options.disableCls || 'disable'; //当前不可用按钮的class

			//要被操作的数据项
			this.$staticDatas	= (options.$staticDatas || $('<div></div>')).remove(); //需要分页的内容项

			this.$dataContainer	= options.$dataContainer || $('<div></div>');

			this.$currentDatas	= [$('<div></div>')];//初始化为空的占位jQ对象

			//其他需要在container中固定显示的内容 如表格表头
			this.$staticHead	= options.$staticHead;
			this.staticFoot		= options.$staticFoot;

			this.maxPage		= options.maxPage || 1; //最大页码

			this.pageTpl		= options.pageTpl || '<a data-page="" data-role=""></a>';

			this.dataURL		= options.dataURL;
			this.dataTpl		= options.dataTpl || '<div data-role="data-item" class="' + options.dataCls || 'data-item' + '"></div>';

			this.ajaxDataState	= (options.ajaxDataState || 'status').replace(/^\.|\.$/g,'').split('.');//ajax请求状态结果
			this.ajaxDataMain	= (options.ajaxDataMain || 'result').replace(/^\.|\.$/g,'').split('.');//ajax请求的数据字段
			this.ajaxDataTotal	= (options.ajaxDataTotal || 'total').replace(/^\.|\.$/g,'').split('.');//ajax请求用于分页的总数量

			this.currentPage	= 1;
			if(options.$staticDatas && options.$staticDatas.length) this.total = options.$staticDatas.length;
		},
		bindEvents: function() { //交互&事件
			var self = this;
			this.$wrapper.on('click', 'a[data-role=page]:not(.' + this.disableCls + ')', function() {
				var page = Number($(this).attr('data-page'));
				if (page === self.currentPage) return;
				self.toLoading();
				self.getDatasByPage(page);
				if (!this.dataURL) self.toPage(page);
			});
			this.$prevBtn.on('click', function() {
				if($(this).is('.' + self.disableCls)) return;
				var page = Number(self.$pagesContainer.find('.' + self.currentCls).attr('data-page')) - 1;
				self.toLoading();
				self.getDatasByPage(page);
				if (!this.dataURL) self.toPage(page);
			});
			this.$nextBtn.on('click', function() {
				if($(this).is('.' + self.disableCls)) return;
				var page = Number(self.$pagesContainer.find('.' + self.currentCls).attr('data-page')) + 1;
				self.toLoading();
				self.getDatasByPage(page);
				if (!this.dataURL) self.toPage(page);
			});
			this.$firstPage.on('click',function (){
				self.toLoading();
				self.getDatasByPage(1);
				self.toPage(1);
			});
			this.$lastPage.on('click',function (){
				self.toLoading();
				self.getDatasByPage(self.maxPage);
				self.toPage(self.maxPage);
			});

			//other
			this.$fastBtn.click(function() {
				var page = Number(self.$fastInput.val());
				if (isNaN(page) || !page || page <= 0 || page > self.maxPage || page === self.currentPage) return;
				self.toLoading();
				self.getDatasByPage(page);
				if (!this.dataURL) self.toPage(page);
			});
			this.$fastInput.keydown(function(e) {
				if (e.keyCode === 13)
					self.$fastBtn.trigger('click');
			})
		},
		paging: function(total) { //初始化分页 为了ajax请求而不是使用$staticDatas.length重新计算maxPage
			this.$pagesContainer.find('[data-role=page]').remove();
			if (!total) {
				this.emit('paging');
				if(!this.total){
					this.$wrapper.hide();
					return 0;
				}
				total = this.total;
			}

			var maxPage = Math.ceil(total / this.perPage),
				pageTpl = this.pageTpl;
			this.maxPage = maxPage; //更新最大页数

			this.upDataPagesBoard();
			this.$lastPage.attr('data-page', maxPage);

			for (var i = 0; i < maxPage; i++) {
				var $item = $(pageTpl).attr('data-page', i + 1).attr('data-role', 'page').text(i + 1);
				if (i === 0) $item.addClass(this.currentCls);
				if (i >= this.visiblePages) {
					$item.hide();
				}
				$item.appendTo(this.$pagesContainer);
			}
			//fix 初始化各个非page按钮的显隐
			this.$prevBtn.addClass(this.disableCls);
			this.$nextBtn.addClass(this.disableCls);
			this.$prevEllipsis.hide();
			this.$nextEllipsis.hide();

			if (maxPage > 1) {//如果不止一页 下一页按钮可用 初始化当前页面为第一页
				this.$nextBtn.removeClass(this.disableCls);
			}
			if (maxPage >= this.visiblePages) {
				this.$nextEllipsis.show();
			}
			this.$wrapper.show();
			if(this.currentPage > maxPage){
				this.getDatasByPage(maxPage);
				this.toPage(maxPage);
			}
			this.emit('paging');
			return maxPage;//完成分页后返回分页的最大页数
		},
		repaintPages: function() {
			var num = this.currentPage,
				halfRange = Math.floor(this.visiblePages / 2),
				left = num - halfRange - 2,
				right = halfRange + num;

			this.$prevEllipsis.hide();
			this.$nextEllipsis.hide();

			var $pages = this.$pagesContainer.find('a').hide();
			var $visiblePages;
			//计算固定显示的页码，判断是否显示省略号
			if (left < 0) {
				$visiblePages = $pages.filter(':lt(' + this.visiblePages + ')').show();
			} else if (right > this.maxPage) {
				var fixLeft = this.maxPage - this.visiblePages - 1;
				$visiblePages = (fixLeft >= 0 ? $pages.filter(':gt(' + fixLeft + ')').show() : $pages.show());
			} else {
				$visiblePages = $pages.filter(':lt(' + right + ')').filter(':gt(' + left + ')').show();
			}
			if (!$visiblePages.eq(0).is('[data-page=1]')) this.$prevEllipsis.show();
			if (!$visiblePages.eq($visiblePages.length - 1).is('[data-page=' + this.maxPage + ']')) this.$nextEllipsis.show();
			//判断上一页下一页按钮是否可用
			if (num === 1) {
				this.$prevBtn.addClass(this.disableCls);
			} else {
				this.$prevBtn.removeClass(this.disableCls);
			}
			if (num === this.maxPage) {
				this.$nextBtn.addClass(this.disableCls);
			} else {
				this.$nextBtn.removeClass(this.disableCls);
			}
			this.$pagesContainer.find('[data-page=' + num + ']').addClass(this.currentCls).siblings('.' + this.currentCls).removeClass(this.currentCls);
		},
		upDataPagesBoard: function() {
			this.$pagesBoard.html(this.maxPage);
		},
		getDatasByPage: function(num) {
			if (num < 1 || num > this.maxPage) return;
			var self = this;
			if (!this.dataURL) {
				if (num === 1) {
					this.$currentDatas = this.$staticDatas.filter(':lt(' + this.perPage + ')');
				} else {
					this.$currentDatas = this.$staticDatas.filter(':gt(' + ((num - 1) * this.perPage - 1) + ')').filter(':lt(' + this.perPage + ')');
				}
			} else { //ajax
				$.getJSON(this.dataURL + '&page=' + num + '&callback=?', function(data) {
					self.$currentDatas = [];
					var state = data;
					for(var i = 0;i < self.ajaxDataState.length;i++){
						state = state[self.ajaxDataState[i]];
					}
					if(state === '1') {
						var main = data;
						for(var i = 0;i < self.ajaxDataMain.length;i++){
							main = main[self.ajaxDataMain[i]];
						}
						$.each(main, function(key, val) {
							var tpl = self.dataTpl;
							$.each(this, function(key, val) {
								if((val.toString()).length == "0") val = '-';
								tpl = tpl.replace(new RegExp('data-' + key,'g'),val);
							});
							self.$currentDatas.push($(tpl));
						});
						var total = data;
						for(var i = 0;i < self.ajaxDataTotal.length;i++){
							total = total[self.ajaxDataTotal[i]];
						}
						total = Number(total);
						self.total = isNaN(total) ? 0 : total;
					}else{
						self.total = 0;
					}
					self.paging();
					self.toPage(num);
				})
			}
		},
		toCurrentDatas: function() {
			var $container = this.$dataContainer;
			$container.empty();
			this.$staticHead ? $container.append(this.$staticHead) : '';
			for(var i = 0;i < this.$currentDatas.length;i ++){
				$container.append($(this.$currentDatas[i]).show());
			}
			$container.show();
			this.$staticFoot ? $container.append(this.$staticFoot) : '';
		},
		toPage: function(num) { //到第几页去
			this.currentPage = num;
			this.repaintPages();
			this.toCurrentDatas();
			this.emit('toPage');
		},
		toLoading:function (){
			this.emit('loading');
		},
		entrance: function(options) { //初始化后的程序入口
			if (this.dataURL) { //如果配置了数据通过ajax来获取
				this.toLoading();
				this.getDatasByPage(1);//默认初始化获取第一页内容
			} else if (options.$staticDatas) {
				this.paging(this.$staticDatas.length);
				this.toLoading();
				this.getDatasByPage(1);
				this.toPage(1);
			} else if (Number(this.maxPage) > 1) {
				this.paging(Number(this.maxPage));
				this.toLoading();
				this.getDatasByPage(1);
				this.toPage(1);
			}
		}
	});
	exports = module.exports = Page;
	exports._name = "Page";
});