$(function() {
	$('.android').on({
		mouseover: function() {
			$(this).css('background-image', 'url(../img/android3.png)');
		},
		mouseout: function() {
			$(this).css('background-image', 'url(../img/android2.png)');
		}
	})
	$('.android,.downLoad').click(function() {
		window.location.href = "http://www.oneyouxi.com.cn:8000/download?data=9"
	})
	$('.nav').children('div').eq(2).click(function() {
		window.location.href = "about_us.html"
	})
	$('.nav').children('div').eq(4).click(function() {
		window.location.href = "cooperation.html"
	})
	$('.nav').children('div').eq(6).click(function() {
		window.location.href = "join_us.html"
	})
})