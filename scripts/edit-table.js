// JavaScript Document
jQuery(function(){
        jQuery('.showtable').click(function(){
              jQuery('.table-comman').hide();
              jQuery('#table'+$(this).attr('target')).show();
        });
	

		$('.icon-list').click(function(){
			$('.icon-list').removeClass('active');
			$(this).addClass('active');
		});	
	
		$('.image-annotation-kill , .reset-btn').click(function(){
			$('.table-edit-popup').css("display","none");
		});
		var editEqn = false;

		$(document).on('click', '.save-cancel-btn-group .save', function(){
			
			if(editEqn) {
				$('.dialog-popup-container').css("display","none");
			
			//$('.ce_para #fd2').clone().append('#OPT_ID_1339');
			$('.ce_para #fd2').addClass('editeue-active');
			var equeClone = $('.ce_para #fd2').clone();
//			equeClone.parents('.eqn-container').
			equeClone.find('img').addClass('cloned-equation').attr('src','images/edit-equation.png').parent('.eqn-container').addClass('active');
			editEqn = false;
			$('#OPT_ID_1339').append(equeClone);
				setTimeout(function() {  
					$('.overlay').css("display","none");
				}, 100);
			} else {
				$('.cursor').before($('<div class="added-equation"><img src="images/add-eqation1.jpg"></div>'));
				$('.dialog-popup-container').css("display","none");
				setTimeout(function() {  
					$('.overlay').css("display","none");
				}, 100);				
			}
			
		});
	
		$(document).on('click', '.equation-edit-icon', function(){
			editEqn = true;
			$(this).parent().find('img').trigger('click');
			//$('.dialog-popup-container').css("display","block");
			setTimeout(function() {  
				$('.math-btn').append($('<a class="equation-popup-delete"></a>'));
			}, 500);			
		});

		$(document).on('click', '.equation-popup-delete', function(){
			setTimeout(function() {  
				$('.dialog-popup-container').css("display","none");
				$('.overlay').css("display","none");
				$('.ce_para #fd2').addClass('editeue-active');
			}, 100);
						
		});
		
		
	

});
