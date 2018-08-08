(function ($) {
	"use strict";
	
	$(document).ready(function(){
		$(document).ajaxError(function(event, jqxhr, settings, thrownError){
			var err = jqxhr.responseJSON;
			var html = '<div role="alert" class="mt-4 alert alert-danger alert-dismissable">';
				html += '<button type="button" data-dismiss="alert" class="close">×</button>';
				html += '<strong>'+err.message+'</strong>';
				html += '</div>';
			$("#error-place-holder").html(html);
		});

		setInterval(function(){
			getRecentBlock();
		},15000);

		// Menu Dropdown Toggle
		if($('.menu-trigger').length){
			$('.menu-trigger').click(function(){
				$(this).toggleClass('active');
				$('.header-area .nav').slideToggle(200);
			});
		}

		// Language Flags Dropdown Toggle
		$('body').click(function(e){
			var el = e.target;
	
			if($(el).parents('.flag-list').length || $(el).hasClass('flag-list')) return; 
	
			if($('.flag-list').css('display') === 'block') {
				$('.flag-list').css('display', 'none');
				return;
			}
	
			if( $(el).hasClass('selected') || $(el).parents('.selected').length) {
				$('.flag-list').css('display', 'block');
			}
		});

		// Token Progress Bar
		if($('.token-progress ul').length){
			$(".token-progress ul").find(".item").each(function(i){
				$('.token-progress ul .item:eq(' +[i]+ ')').css("left", $('.token-progress ul .item:eq(' + [i] + ')').data('position'));
			});
			var progress = $(".token-progress ul .progress-active").data('progress');
			$(".token-progress ul .progress-active").css('width', progress);
		}
	});

	// Page loading animation
	$(window).load(function(){
		$(".loading-wrapper").animate({
			'opacity': '0'
		}, 600, function(){
			setTimeout(function(){
				$(".loading-wrapper").css("visibility", "hidden").fadeOut();

				// Parallax init
				if($('.parallax').length){
					$('.parallax').parallax({
						imageSrc: 'assets/images/parallax.jpg',
						zIndex: '1'
					});
				}
			}, 300);
		});
	});

	// Header Scrolling Set White Background
	$(window).scroll(function() {
		var width = $(window).width();
		if(width > 991) {
			var scroll = $(window).scrollTop();
			if (scroll >= 30) {
				$(".header-area").addClass("header-sticky");
			}else{
				$(".header-area").removeClass("header-sticky");
			}
		}
	});

	function getRecentBlock(){
		if(window.location.pathname.indexOf('markets')===-1){		
			$.ajax({
				url: '/data/recent-block',			
				contentType: 'application/json',
				dataType: 'json',					
				type:'GET'
			}).done(function(data){
				$('#block_number').html(data.blockIndex);
			});
		}
	}
})(jQuery);
