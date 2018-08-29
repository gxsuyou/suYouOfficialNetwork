define(function (require, exports, module){
	var Page	= require('./../page'),
		Fader	= require('./../fader').Fader,
		pia		= require('./../public_inter_action').publicInterAction;

	pia.init();
	function home(options){
		this.init(options);
	}

	home.prototype = {
		init:function (options){
			this.initElements(options);
			this.initLazyLoadImg();
			this.bindEvents();
		},
		initElements:function (options){
			//this.offLine	= /http:\/\/(.*?)t\.(.*?)/.test("http://" + location.hostname);
			this.offLine	= this.offLine ? 't' : '';
			this.linkStatus	= false;
		},
		bindEvents:function (){
		    var self = this;
			$('.ranking_game_box li').on('mouseover',function (){
				$(this).addClass('current').siblings().removeClass('current');
			});
			$('.more_game_box .game_list').on('mouseover',function (){
				$(this).addClass('current').siblings().removeClass('current');
			});
			$('.hotgame_box').on('mouseover','.fine_list',function (){
				$(this).addClass('current').siblings().removeClass('current');
				$(this).find(".gameintro_box").stop(false,true).animate({"bottom":"-1px"});
			});
			$('.hotgame_box').on('mouseleave','.fine_list',function (){
				$(this).removeClass('current');
				$(this).find(".gameintro_box").stop(false,true).animate({"bottom":"-125px"});
			});

			self.initFocusSlide();
			self.initFocusLikeGame();
			self.initGameNewServer();
			self.initFriendLink();
		},
	
		initLazyLoadImg:function (){
			//延时加载页面图片
			require.async('./../../com/js/lazyloadimg',function (){
				$('img[data-src]').live('inview',function(event,isVisible){
					if (!isVisible) {return;}
					var img = $(this);
					img.css('opacity',0);
					img.load(function(){img.animate({opacity:1},500);});
					img.attr('src',img.attr('data-src'));
					img.removeAttr('data-src');
				});
			});
		},
		initFocusSlide:function (){
			var focusSlide = new Fader({
				ele:'#homeslidebox',
				prevBtn:'.home_slide #hs_prev',
				nextBtn:'.home_slide #hs_next',
				nav:'#hs_btn',
				currentNavCls:'activeSlide',
				event:'mouseover'
			});
			
			$('.home_slide').on('mouseover',function (){
				$('#hs_prev,#hs_next').show();
			}).on('mouseleave',function (){
				$('#hs_prev,#hs_next').hide();
			});
			//切换加载图片
			focusSlide.on('fadeTo',function (){
				var img = $(this.currentEle.find('img'));
				if(img.attr('focus-src') != undefined){
					img.attr('src',img.attr('focus-src'));
					img.removeAttr('focus-src');
				}
			});
			//加载第一张图片
			var img = $(focusSlide.eles.eq(0)).find('img');
			if(img.attr('focus-src') != undefined){
				img.attr('src',img.attr('focus-src'));
				img.removeAttr('focus-src');
			}
		},
		initFocusLikeGame:function (){
			var self = this;
			$likeGameContainer	= $('.home_like .like_game_box');
			$changeLikeGameBtn	= $('.home_like .changeLikeGame')
			var tempGameStr		= $likeGameContainer.attr('data-game');
			var tempGameArr		= tempGameStr.split(",")
			var gameArray		= new Array();
			for (var index in tempGameArr){
				if(tempGameArr[index].length > 0 && $.inArray(tempGameArr[index], gameArray) == -1){
					gameArray.push(tempGameArr[index]);
				}
			}

			$changeLikeGameBtn.on('click',function (){
				var gameDatas = array_rand(gameArray, 2);
				var htmlStr = '';
				for (var b in gameDatas) {
					var gameInfo = gameDatas[b].split(":");
					htmlStr += '<li class="like_game_list"><a class="like_game_img" target="_blank" href=""><img width="90" height="45" alt="' + gameInfo[1] + '" src="/images/game/' + gameInfo[0] + '/chundilogo.jpg"></a><a class="like_game_name" target="_blank" href="">' + gameInfo[1] + '</a></li>';
				}
				$likeGameContainer.html(htmlStr).show();
			});
			$changeLikeGameBtn.trigger('click');

			// 数组随机选择函数
			function array_rand(arr, num){
				var temp_array = new Array();
				for (var index in arr) {
					temp_array.push(arr[index]);
				}
				var return_array = new Array();
				for (var i = 0; i < num; i++){
					if(temp_array.length > 0){
						var arrIndex = Math.floor(Math.random() * temp_array.length);
						return_array[i] = temp_array[arrIndex];
						temp_array.splice(arrIndex, 1);
					}else{
						break;
					}
				}
				return return_array;
			}
		},
		initGameNewServer:function (){
			// tab初始化
			var getted = {};
			pia.tabs['banner'].on('tabTo',function (){
				if(this.index == 1){
					$('.side_kaifu .new_page').hide();
					$('.side_kaifu .new_games').hide();
					$('.side_kaifu .soon_page').show();
					$('.side_kaifu .soon_games').show();
				}else{
					$('.side_kaifu .soon_page').hide();
					$('.side_kaifu .soon_games').hide();
					$('.side_kaifu .new_page').show();
					$('.side_kaifu .new_games').show();
				}
				if(getted[this.index]) return;
				getted[this.index] = true;
				return;
			});

			var newPage = new Page({
				$Page:$('.side_kaifu .new_page'),
				$prevBtn:$('.side_kaifu .new_page .left_arrow'),
				$nextBtn:$('.side_kaifu .new_page .right_arrow'),
				$dataContainer:$('.side_kaifu .new_games'),
				$staticDatas:$('.side_kaifu .new_games .game_list'),
				perPage:7
			});

			var soonPage = new Page({
				$Page:$('.side_kaifu .soon_page'),
				$prevBtn:$('.side_kaifu .soon_page .left_arrow'),
				$nextBtn:$('.side_kaifu .soon_page .right_arrow'),
				$dataContainer:$('.side_kaifu .soon_games'),
				$staticDatas:$('.side_kaifu .soon_games .game_list'),
				perPage:7
			});

			newPage.on('toPage',function (){
				$('.side_kaifu .new_page .total_page').text(this.maxPage);
				$('.side_kaifu .new_page .current_page').text(this.currentPage);
				this.$currentDatas.on('mouseover',function (){
					$(this).addClass('current').siblings().removeClass('current');
				}).on('mouseleave',function (){
					$(this).removeClass('current');
				}).each(function (){
					$(this).find('.g_time').html(timeHandle($(this)));
					if(timeCompare(this) > 0){
						$(this).addClass('gl_hot');
						if($(this).attr('data-serverno') < 10){
							$(this).find('.g_name em').addClass('p1_ico p1_new_tag');
						}else{
							$(this).find('.g_name em').addClass('p1_ico p1_hot_tag');
						}
						$(this).find('.minibutton_a').addClass('orange_button').text('开始游戏');
					} else {
						if($(this).attr('data-serverno') < 10){
							$(this).find('.g_name em').addClass('p1_ico p1_new_tag');
						}
						$(this).find('.minibutton_a').addClass('blue_button remind_btn').text('开服提醒');
					}
					var $next = $(this).next();
					if(!$next.length || (timeCompare($next) < 0 && $(this).is('.gl_hot')) || (timeCompare($next) >= 0 && $(this).is(':not(.gl_hot)'))){
						$(this).addClass('gl_end');
					}
					var $prev = $(this).prev();
					if(!$prev.length){
						$(this).addClass('gl_start');
					}
				}).eq(this.$currentDatas.length - 1).addClass('gl_end');
			});

			soonPage.on('toPage',function (){
				$('.side_kaifu .soon_page .total_page').text(this.maxPage);
				$('.side_kaifu .soon_page .current_page').text(this.currentPage);
				this.$currentDatas.on('mouseover',function (){
					$(this).addClass('current').siblings().removeClass('current');
				}).on('mouseleave',function (){
					$(this).removeClass('current');
				}).each(function (){
					$(this).find('.g_time').html(timeHandle($(this)));
					$(this).find('.minibutton_a').addClass('blue_button remind_btn').text('开服提醒');
					var $next = $(this).next();
					if(!$next.length || (timeCompare($next) < 0 && $(this).is('.gl_hot')) || (timeCompare($next) >= 0 && $(this).is(':not(.gl_hot)'))){
						$(this).addClass('gl_end');
					}
					var $prev = $(this).prev();
					if(!$prev.length){
						$(this).addClass('gl_start');
					}
				}).eq(this.$currentDatas.length - 1).addClass('gl_end');
			});

			function timeCompare(ele){
				var timeArr	= $(ele).attr('data-opentime').split(' '),
					ymd		= timeArr[0].split('-'), hms = timeArr[1].split(':');

				var kaifuTime	= new Date(ymd[0],+ ymd[1] - 1,ymd[2],hms[0],hms[1],hms[2]).getTime();
				var currentTime	= new Date().getTime();
				return currentTime - kaifuTime;
			}

			function timeHandle(ele){
				var timeArr	= $(ele).attr('data-opentime').split(' '),
					ymd		= timeArr[0].split('-'), hms = timeArr[1].split(':');

				var currentDate	= new Date();
				var kaifuTime	= new Date(ymd[0],+ ymd[1] - 1,ymd[2]).getTime();
				var currentTime	= new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate()).getTime();

				var kaifuDay	= new Date(ymd[0],+ ymd[1] - 1,ymd[2]).getDate();
				var currentDay	= new Date().getDate();

				if(kaifuDay == currentDay){
					return "今天 " + hms[0] + ":" + hms[1];
				}else if((currentTime - kaifuTime)/(86400000) == 1){
					return "昨天 " + hms[0] + ":" + hms[1];
				}else if((currentTime - kaifuTime)/(86400000) == 2){
					return "前天 " + hms[0] + ":" + hms[1];
				}else if((kaifuTime - currentTime)/(86400000) == 1){
					return "明天 " + hms[0] + ":" + hms[1];
				}else if((kaifuTime - currentTime)/(86400000) == 2){
					return "后天 " + hms[0] + ":" + hms[1];
				}else{
					return ymd[1] + "-" + ymd[2] + " " + hms[0] + ":" + hms[1];
				}
			}		
		

			newPage.toPage(1);
			soonPage.toPage(1);

			$('.side_kaifu .soon_page').hide();
			$('.side_kaifu .soon_games').hide();
		},
		initFriendLink:function (){
			var self = this;
			var linkBox = $(".link_main .link_con");
			$('.link_main .link_arrow a').on('click',function (){
				if(self.linkStatus == true) {
					linkBox.animate({height:'48px'}, 400);
					$(this).attr("class", "icon_link_on");
					self.linkStatus = false;
				}else{
					var num = linkBox.children("li").length;
					var h = Math.ceil(num / 10) * 24;
					linkBox.animate({"height":h+"px"}, 400);
					$(this).attr("class", "icon_link_off");
					self.linkStatus = true;
				}
			});
		}
	}
	function formatDate(string) {
		string	= string.replace(/\+/gm,' ');
		var f	= string.split(' ', 2);
		var d	= (f[0] ? f[0] : '').split('-', 3);
		var t	= (f[1] ? f[1] : '').split(':', 3);
		return (
			d[1] + '-' + d[2] + ' ' + t[0] + ':' + t[1] || null
		);
	}
	window.home = new home();
});