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

		particlesJS('particles-js',
			{
				"particles": {
					"number": {
						"value": 80,
						"density": {
							"enable": true,
							"value_area": 800
						}
					},
					"color": {
						"value": "#ffffff"
					},
					"shape": {
						"type": "circle",
						"stroke": {
							"width": 0,
							"color": "#000000"
						},
						"polygon": {
							"nb_sides": 5
						},
						"image": {
							"src": "img/github.svg",
							"width": 100,
							"height": 100
						}
					},
					"opacity": {
						"value": 0.5,
						"random": false,
						"anim": {
							"enable": false,
							"speed": 1,
							"opacity_min": 0.1,
							"sync": false
						}
					},
					"size": {
						"value": 5,
						"random": true,
						"anim": {
							"enable": false,
							"speed": 40,
							"size_min": 0.1,
							"sync": false
						}
					},
					"line_linked": {
						"enable": true,
						"distance": 150,
						"color": "#ffffff",
						"opacity": 0.4,
						"width": 1
					},
					"move": {
						"enable": true,
						"speed": 6,
						"direction": "none",
						"random": false,
						"straight": false,
						"out_mode": "out",
						"attract": {
							"enable": false,
							"rotateX": 600,
							"rotateY": 1200
						}
					}
				},
				"interactivity": {
					"detect_on": "canvas",
					"events": {
						"onhover": {
							"enable": true,
							"mode": "repulse"
						},
						"onclick": {
							"enable": true,
							"mode": "push"
						},
						"resize": true
					},
					"modes": {
						"grab": {
							"distance": 400,
							"line_linked": {
								"opacity": 1
							}
						},
						"bubble": {
							"distance": 400,
							"size": 40,
							"duration": 2,
							"opacity": 8,
							"speed": 3
						},
						"repulse": {
							"distance": 200
						},
						"push": {
							"particles_nb": 4
						},
						"remove": {
							"particles_nb": 2
						}
					}
				},
				"retina_detect": true,
				"config_demo": {
					"hide_card": false,
					"background_color": "#b61924",
					"background_image": "",
					"background_position": "50% 50%",
					"background_repeat": "no-repeat",
					"background_size": "cover"
				}
			}
		);
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
