
define(['zepto', 'backbone', 'gmu', 'cube/fixed'], function($, Backbone, gmu, Fixed) {

	var Popover = Backbone.View.extend({

		events: {
			'click li': 'onClick'
		},

		initialize: function(args) {
			console.log('popover init');
			// var name = $(this.el).attr('name');
			if (arguments && arguments.length > 0) {
				var config = arguments[0];
				var key;
				for (key in config) {
					if (key in this) this[key] = config[key];
				}
				var obj = {};
				for (var configKey in this.config) {
					obj[configKey] = this.config[configKey];
				}
				for (var argkey in config) {
					obj[argkey] = config[argkey];
				}
				this.config = obj;
			}
			this.isMaskShow = false;
			this.mask = $('<div class="popver-masker" style="display: none;width: 100%;min-height:1000px; z-index:100; position: absolute;"></div>');

			this.render();

        },

		render: function() {
			var me = this;



			var trigger = $(me.el).attr('trigger');/* add by fengqiuming 20130605    */
			var btn = $(me.config.parent).find(trigger)[0];


			var target = $(me.el).attr('target'); /* add by fengqiuming 20130605    */
			if(target==''|| null) target = trigger;
			//remove by qiuming 2013.05.06  code:var btn = $(this.config.parent).find('a[popoverTarget="#' + this.el.id + '"]')[0];
			$(btn).bind('click', function() {


				/* add by fengqiuming 20130605  start  */
				$(me.el).offset(
					{'left' : 0 ,
					  'top' : 0}
					);
				$(me.el).css(
					{'left' : 0 ,
					  'top' : 0}
					);


		        function rePosition(){
		        	var targetPosition = $(me.el).attr('position');
				
					if(targetPosition=='' || null) targetPosition='absolute';
					$(me.el).css({'position':targetPosition});

					var targetWidth = $(me.config.parent).find(target).width();
					var targetHeight = $(me.config.parent).find(target).height();
					var targetOffset = $(me.config.parent).find(target).offset();
					var popoverWidth = $(me.el).width();
					var targetTop = targetOffset.top;
					if($(me.el).attr('position')=='fixed'){
						targetTop = 10;
					}
					// alert('targetOffset.left = '+ targetOffset.left + "; targetWidth/2 = "+ targetWidth/2 +"; popoverWidth/2 = "+popoverWidth/2);

					$(me.el).offset(
						{'left' : (targetOffset.left + (targetWidth/2) /*+ (popoverWidth/2)*/ ),
						  'top' : (targetTop + targetHeight - 35)}
					);
		        }

		        if(me.reposi==null){
			        me.reposi = rePosition;
			    }
		        rePosition();

				me.onShow();

				

				/* add by fengqiuming 20130605  end  */
			});
			console.info('======');
			return this;
		},
		
		reposi:null,
		onShow: function() {

			var me = this;
			var popover = this.el;

			var popDisplay = $(popover).css('display');
			if(!this.isMaskShow){
				$('body').prepend(this.mask);
				this.isMaskShow = true;
			}


			$(popover).removeClass('visible');
			if (popDisplay == "none") {
				popover.style.display = 'block';
				//popover.style.display = 'block';
				// 选项卡出现的时候，遮罩层也相应出现
				 this.mask.css('display', 'block');

		        $(window).on('orientationchange',me.reposi);
		        $(window).on('resize', me.reposi);
			} else {
				popover.style.display = 'none';
				this.mask.css('display', 'none');
		        $(window).off('orientationchange',me.reposi);
		        $(window).off('resize', me.reposi);
			}
			

			popover.offsetHeight;
			popover.classList.add('visible');
;
			var popover_iScroll = new iScroll('popver-scroller', {
				useTransition: true
			});
			this.iScroll = popover_iScroll;

			this.iScroll.refresh();

			this.mask.bind('click', function() {
				me.onMaskClick();
			});


			Fixed.FixPopoverOn();
			Fixed.FixHeaderWithPopoverOffsetTop();

		},
		onClick: function(e) {
			console.log('popover:select');
			this.onHide();
		},
		onHide: function() {
			$(this.el).css('display', 'none');
			this.mask.css('display', 'none');
		},
		onMaskClick: function() {
			console.info("mask click");
			$(this.el).css('display', 'none');
			this.mask.css('display', 'none');
			Fixed.FixPopoverOff();
		}

	}, {
		compile: function(el) {
			console.log('popover compile');
			var me = this;
			return _.map($(el).find(".popover"), function(tag) {

				
				return new Popover({
					el: tag,
					parent: el
				});
			});
		}
	});

	return Popover;
});