define(['require', 'cube/cube', 'text!<%= module %>/<%= view %>.html'],
	function(require, Cube, viewTemplate) {

		return Cube.View.extend({

			id: '<%= module %>_<%= view %>',

			initialize: function() {

			},

			events: {

			},

			bindings: {

			},

			render: function() {
				$(this.el).html(viewTemplate);

				Cube.View.prototype.render.call(this);
				return this;
			},

			onShow: function() {

			}
		}); //view define

	});