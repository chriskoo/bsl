 define(['zepto', 'underscore', 'backbone'], function($, _, Backbone) {

 	var Base64Img = Backbone.View.extend({

 		initialize: function() {
 			console.info(this.el);

 			var img_el = document.createElement('img');
 			$(img_el).attr('href', 'test.img');
 			var url = $(this.el).attr('url');

 			var myDate = new Date();
 			$.ajax({
 				type: "GET",
 				url: (url),
 				dataType: "text",
 				data: "currentTime=" + myDate.getTime(),
 				success: function(retdata, textStatus) {
 					if (retdata) {
 						$(img_el).attr('src', retdata);
 					}
 				},
 				error: function(XMLHttpRequest, textStatus, errorThrown) {
 					console.log("err");
 				}
 			})


 			$(this.el).replaceWith(img_el);
 		},

 	}, {
 		compile: function(elContext) {
 			var me = this;
 			return _.map($(elContext).find("Base64Img"), function(tag) {
 				var base64img = new Base64Img({
 					el: tag
 				});
 				return base64img;
 			});

 		}
 	});

 	return Base64Img;

 });