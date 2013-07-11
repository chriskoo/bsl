 define(['zepto'], function($){

	var Slider = function(config) {
		this.config = {};
		this.config = $.extend(this.config, config);
		this.targetObj = $("#" + config.id);
		this.render();
	};

	Slider.prototype.render = function() {
		var id = this.config.id;
		var spanid = id+"_span";
		var slider = $(this.targetObj);
		var name = slider.attr("name");
		var min = slider.attr("min");
		var max = slider.attr("max");
		var step = slider.attr("step");
		var value = slider.attr("value");
		var style = slider.attr('style');
		var tabindex = slider.attr("tabindex");
		var classes = slider.attr("class");
		
		var sliderDiv = $("<div></div>");
		var sliderSpan = $("<span></span>").attr('id', spanid).addClass("slider_span");
		if(value) sliderSpan.text(value);

		var sliderInput = $("<input/>").attr('type', 'range').attr('id', id);
		if(name) sliderInput.attr('name', name);
		if(min) sliderInput.attr('min', min);
		if(max) sliderInput.attr('max', max);
		if(step) sliderInput.attr('step', step);
		if(value) sliderInput.attr('value', value);
		if(typeof(style) == 'string') sliderInput.attr('style', style);
		if(tabindex) sliderInput.attr('tabindex', tabindex);
		if(classes) sliderInput.addClass(classes);

		var myconfig = this.config;
		sliderInput.change(function(){
			var value = $(this).val();
			sliderSpan.text(value);
			if(myconfig.change) myconfig.change(value);
		});

		sliderDiv.append(sliderSpan);
		sliderDiv.append(sliderInput);

		sliderDiv.insertBefore(slider);
		slider.remove();
	};


	return Slider;
});

// require(['cube/cube-list']);