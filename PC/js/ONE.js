$(function() {

  $('.downLoad').mouseover(function(){
		$('.qrcodeImg').css('display','block');
	});

	$('.downLoad').mouseout(function(){
			$('.qrcodeImg').css('display','none');
	})


	$('.android').click(function() {
		window.location.href = "https://admin.oneyouxi.com.cn/www/download/onegame.apk"
	});
	$('.ios').click(function() {
	 window.location.href = "https://admin.oneyouxi.com.cn/www/download/onegame.ipa"
 });



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
