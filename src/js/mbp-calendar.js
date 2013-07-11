window.showDialog = window.showDialog || function(dialogId) {
	if(window.scrollers && window.scrollers[dialogId])
		window.scrollers[dialogId].show();
};

window.hideDialog = window.hideDialog || function(dialogId) {
	if(window.scrollers && window.scrollers[dialogId])
		window.scrollers[dialogId].hide();
};
Date.prototype.toDayStr = Date.prototype.toDayStr || function() {
	var year = this.getFullYear();
	var mon = this.getMonth()+1;
	var day = this.getDate();
	return year + "-" + (mon < 10 ? "0" + mon : mon) + "-" + (day < 10 ? "0" + day : day);
}
Date.prototype.toDayModel = Date.prototype.toDayModel || function() {
	var year = this.getFullYear();
	var mon = this.getMonth()+1;
	var day = this.getDate();
	var week=this.getDay();
	// var Week=['周日','周一','周二','周三','周四','周五','周六'];
	// var chinses=['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
	var date=new Object();
	// date.mon=chinses[mon-1];
	date.day=day;
	// date.week=Week[week];
	date.mon = mon - 1;
	date.week = week;
	return date;
}
define(['zepto', 'backbone', 'underscore', "cube/cal_main",  "i18n!cube/nls/cube-calendar-local",'cube/session'], function($, Backbone, underscore, _, Locale,Session){
	var Calendar  = Backbone.View.extend({
		tagName: 'div',
		elContext: document,
		events: {
          "click" : "dateInputClick"
        },

        render: function(){
        	//this.$eprop("readOnly", "readOnly").prop("id", _config.id).prop("name",_config.name);
        	return this;
        },
		
		dateInputClick : function(e) {
			alert("");
		}
	},{
		compile: function(elContext){
			var me = this;
			//$(elContext).find("calendar").each(function(){
            return _.map($(elContext).find("calendar"), function(tag){
			
				var _this = $(tag);//$(this);
				var _config = {
					modal: true
				};
				//var id = _this.attr('id');
				var atts = tag.attributes, len = atts.length, att, i = 0 ;
				for(; i < len ; i++){
					att = atts[i];
					if(att.specified){
						_config[att.name] = att.value;
					}
				}

				if(! _config.customparse || "msb" != _config.customparse) {
					return;
				}

				if(! _config.name) {
					_config.name =  _config.id;
				}
				if(! _config.style) {
					_config.style = "background-color: #F7F7F7;";
				}
				var dateItem = $("<input type='hidden' style='"+_config.style+"' />").prop('readonly', true).prop("id", _config.id).prop("name",_config.name);
				var nextItem=$("<input type='hidden' style='background:#FFF;cursor:pointer'/>").prop('readonly', true).prop("id", "queryDate_arr").prop("name","queryDate_arr");
				var dateDiv=$("<div id='dateDiv"+_config.id+"' class='hbox' style='width:100%'></div>");
				var fltstatus=Session.loadObject("com.csair.mbp.flightstatus/fltStatusList.html");
				var booking=Session.loadObject("com.csair.mbp.booking_new/bookinglist.html");
				
				if(_config.value == "today") {
				//航班动态
				    if(fltstatus&&fltstatus.queryDate){
						dateItem.val(fltstatus.queryDate);
						var arys= new Array();
						arys=fltstatus.queryDate.split('-');
						var day=new Date(arys[0],arys[1]-1,arys[2]); 
						var date=day.toDayModel();
					}else{
						dateItem.val(new Date().toDayStr());
						var date=new Date().toDayModel();
					}
					dateDiv.html("<div class='flex1 vbox'><div class='calendar_title'>"+Locale.depStr+"</div><div class='hbox'style='margin-top:5px'><span class='flex1 calendar_week'>"+Locale.months[date.mon]+"<br>"+Locale.weekDayName[date.week]+"</span><div class='flex2 calendar_day'>"+date.day+"</div></div></div><div class='flex2 arrow'><img src='../com.csair.mbp.booking_new/images/arrow.png' ></div>"); 
				}else if(_config.value=="tomorrow"){
				//机票预订，选择出发时间
				    if(booking&&booking.queryDate_dep){
						dateItem.val(booking.queryDate_dep);
						var arys= new Array();
						arys=booking.queryDate_dep.split('-');
						var day=new Date(arys[0],arys[1]-1,arys[2]); 
						var date=day.toDayModel();
					}else{
						var todayDate=new Date();
						var day = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()+1, 0, 0, 0, 0);
						dateItem.val(day.toDayStr());
						var date=day.toDayModel();
					}
					dateDiv.html("<div class='flex1 vbox'><div class='calendar_title'>"+Locale.depStr+"</div><div class='hbox'style='margin-top:5px'><span class='flex1 calendar_week'>"+Locale.months[date.mon]+"<br>"+Locale.weekDayName[date.week]+"</span><div class='flex2 calendar_day'>"+date.day+"</div></div></div><div class='flex2 arrow'><img src='../com.csair.mbp.booking_new/images/arrow.png' ></div>"); 
				}else if(_config.value="nextDay"){
				//机票预订，选择到达时间
				    if(booking&&booking.queryDate_arr){
					  	dateItem.val(booking.queryDate_arr);
						var arys= new Array();
						arys=booking.queryDate_arr.split('-');
						var day=new Date(arys[0],arys[1]-1,arys[2]); 
						var date=day.toDayModel();
					}else{
						var todayDate=new Date();
						var day = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()+2, 0, 0, 0, 0);
						dateItem.val(day.toDayStr());
						var date=day.toDayModel();
					}
					dateDiv.html("<div class='flex1 vbox'><div class='calendar_title'>"+Locale.retStr+"</div><div class='hbox'style='margin-top:5px'><span class='flex1 calendar_week'>"+Locale.months[date.mon]+"<br>"+Locale.weekDayName[date.week]+"</span><div class='flex2 calendar_day'>"+date.day+"</div></div></div><div class='flex2 arrow'><img src='../com.csair.mbp.booking_new/images/arrow.png' ></div>"); 
				}
				 
				if( _config["class"]) {
					dateItem.prop("class",_config["class"]);
					dateDiv.prop("class",_config["class"]);
				}

				var jqmWindowDiv;
				var cal_container = $(elContext).find("#cal_container");

				if(cal_container.size() == 0) {
					//jqmWindowDiv = $('<div id="cal_jqmWindowDiv" class="jqmWindow"></div>').prependTo(elContext);
					//cal_container = $('<div class="cal_container" id="cal_container" ></div>').appendTo(jqmWindowDiv);	
					jqmWindowDiv = $('<div id="cal_jqmWindowDiv" class="jqmWindow"></div>').prependTo(elContext);
					var cal_iScroll = $('<div id="cal_iScroll" style="width: 100%; height: 100% ;"></div>').appendTo(jqmWindowDiv);	
					cal_container = $('<div class="cal_container" id="cal_container" style="height: 415px;"></div>').appendTo(cal_iScroll);
					
				}
				else {
					jqmWindowDiv =  $(elContext).find("#cal_jqmWindowDiv");
				}
				var cal_callback = function(day,weekDay) {
					jqmWindowDiv.hide();
					if(day){
						$("#"+cal_container.attr("cal_input_id")).val(day);
						var arys= new Array();
						arys=day.split('-');
						var newDate=new Date(arys[0],arys[1]-1,arys[2]); 
						var date=newDate.toDayModel();
						$("#dateDiv"+cal_container.attr("cal_input_id")).html("<div class='flex1 vbox'><div class='calendar_title'>"+Locale.depStr+"</div><div class='hbox'style='margin-top:5px'><span class='flex1 calendar_week'>"+Locale.months[date.mon]+"<br>"+Locale.weekDayName[date.week]+"</span><div class='flex2 calendar_day'>"+date.day+"</div></div></div><div class='flex2 arrow'><img src='../com.csair.mbp.booking_new/images/arrow.png' ></div>");
						$("#dateDiv"+cal_container.attr("cal_input_id")).append(dateItem);
						if(_config.value=="tomorrow"){
							var nextDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()+1, 0, 0, 0, 0);
							var date1=nextDate.toDayModel();
							var day1=nextDate.toDayStr();
							$("#"+"queryDate_arr").val(day1);
							$("#dateDiv"+"queryDate_arr").html("<div class='flex1 vbox'><div class='calendar_title'>"+Locale.retStr+"</div><div class='hbox'style='margin-top:5px'><span class='flex1 calendar_week'>"+Locale.months[date1.mon]+"<br>"+Locale.weekDayName[date1.week]+"</span><div class='flex2 calendar_day'>"+date1.day+"</div></div></div><div class='flex2 arrow'><img src='../com.csair.mbp.booking_new/images/arrow.png' ></div>");
							$("#dateDiv"+"queryDate_arr").append(nextItem);
							
						}
					
					}
						//jqmWindowDiv.jqmHide();
						//dateItem.val(day);
				};
				
				//alert("vvv1");
				dateItem.appendTo(dateDiv);
				 _this.replaceWith(dateDiv);
				//dateItem.appendTo(_this.parent());
				
				//_this.remove();
				//alert(_config.setText1);
				//jqmWindowDiv.jqm(_config);
				dateDiv.click(function () {
					if(dateItem.val()) {
							var d = dateItem.val().split("-");
							var day = new Date(d[0],(d[1]-1),d[2],0,0,0,0);
							cal_container.init_cal(day, cal_callback);
						}
						cal_container.attr("cal_input_id", _config.id);
						//jqmWindowDiv.show();
					//cal_container.attr("cal_input_id", _config.id);
					jqmWindowDiv.show();	
					if(!window.calIScroll)
					window.calIScroll = new iScroll("cal_iScroll", {
						useTransition: true,
						hScroll:false
					});	
					window.calIScroll.refresh();		
				})
			//$.scrollers[_config.id].show();
			//$(dateItem).scroller('destroy').scroller(_config).show();
			//alert(_config.id);
			});
		}
	});
	return Calendar;
});
