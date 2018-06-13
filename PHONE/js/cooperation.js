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
	$('.bottom_art > span').click(function(){
		var page = $(this).attr('data-page')
		window.location.href = page
	})
	$('.back').click(function(){
		window.history.back(); 
	})
})