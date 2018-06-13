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
	$('.position_detail').click(function(){
		window.location.href = "job_detail.html"
	})
	$('.back').click(function(){
		window.history.back(); 
	})
})