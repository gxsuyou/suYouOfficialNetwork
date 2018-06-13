$(function(){
	$('.options').click(function(){
		$(this).addClass('cancel')
		$('.shade').removeClass('hidden')
		$('.pop').addClass('come')
		$('.pop').removeClass('go')
	})
	$('.shade').click(function(){
		$('.options').removeClass('cancel')
		$('.shade').addClass('hidden')
		$('.pop').removeClass('come')
		$('.pop').addClass('go')
	})
	$('.pop > div').click(function(){
		var page = $(this).attr('data-page')
		window.location.href = page
	})
	$('.android').click(function(){
		window.location.href = "http://www.oneyouxi.com.cn:8000/download?data=9"
	})
	$('.top').click(function(){
		$("html,body").animate({scrollTop:0}, 500);
	})
	$('.bottom_art > span').click(function(){
		var page = $(this).attr('data-page')
		window.location.href = page
	})
})