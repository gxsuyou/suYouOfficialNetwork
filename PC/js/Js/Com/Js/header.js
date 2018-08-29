define(function(require, exports, module){
	var events	= require('./../events') || window.events,
		Util	= require('./../util'),
		gameDatas = gameDatas || window.gameDatas;

	var addFavorite = window.addFavorite = function(a, title, url) {
		url = url || a.href;
		title = title || a.title;
		try{ // IE
			window.external.addFavorite(url, title);
		} catch(e) {
			try{ // Firefox
				window.sidebar.addPanel(title, url, "");
			} catch(e) {
				if (/Opera/.test(window.navigator.userAgent)) { // Opera
					a.rel = "sidebar";
					a.href = url;
					return true;
				}
				alert('您的浏览器不支持自动加入收藏，请使用 Ctrl+D 进行添加');
			}
		}
		return false;
	};

});