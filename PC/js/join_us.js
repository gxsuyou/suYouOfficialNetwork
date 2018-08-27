$(function(){
	$('.nav').children('div').eq(0).click(function(){
		window.location.href = "/"
	})
	$('.nav').children('div').eq(1).click(function(){
		window.location.href = "about_us.html"
	})
	$('.nav').children('div').eq(2).click(function(){
		window.location.href = "cooperation.html"
	})
	$('.name').children('div').click(function(){
		window.open("job_detail.html")
	})

})
