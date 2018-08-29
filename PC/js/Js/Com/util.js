define(function (require,exports,module){

	Util = {
		cookie:function (name, value, ttl, path, domain){
			// 获取或设置cookie方法
			if (arguments.length == 1) {
				try {
					var  a = (new RegExp('\\b'+name+'=([^;]*);?', 'i')).exec(document.cookie.toString());
				} catch(e) {
					return false;
				}
				if (a instanceof Array && a.length > 1) return a[1];
				return '';
			}

			var  date = '';
			if (!isNaN(ttl)) {
				date = new Date();
				date.setTime(date.getTime() + parseInt(ttl) * 1000);
				date = ";expires=" + date.toGMTString();
			}
			document.cookie = name + "=" + value + (domain ? ";domain=" + domain : ';domain=hly.com') + (path ? ";path=" + path : ';path=/') + date;
			return true;
		},
		domain:function(){
			return window.location.host.replace(/.*?([\w][\w-]*\.(com\.cn|org\.cn|net\.cn|com|cn|co|net|org|gov|cc|biz|info))(?=(\/|\?|\&)|$).*/, "$1");
		}
	}

	exports = module.exports = Util;
});