/*
 * JS中初始化该控件。
 * var loader = new Loader({
 *       autoshow:false,    //是否初始化时就弹出加载控件
 *       target:'#test'     //页面目标组件表识
 *  });
 * loader.show();       //显示加载窗
 * loader.hide();       //隐藏加载窗
 * loader.hideAll();    //隐藏所有加载窗
 * 
 * loading组件，最终转换出html5
 * <div class="cube-loader">
 *      <div class="cube-loader-icon">
 *      </div>
 * </div>
 */
define(['zepto'], function($){
    var me;
    var keys = [37, 38, 39, 40];
    var canceled;

    function preventDefault(e) {
      e = e || window.event;
      if (e.preventDefault)
          e.preventDefault();
      e.returnValue = false;  
    }
    
    function keydown(e) {
        for (var i = keys.length; i--;) {
            if (e.keyCode === keys[i]) {
                preventDefault(e);
                return;
            }
        }
    }

    function scrolling(e) {
        preventDefault(e);
    }

    function disableScrolling(){
        if(window.addEventListener){
            window.addEventListener('DOMMouseScroll', scrolling, false);
            window.addEventListener('touchmove',scrolling,false);
            window.onmousewheel = document.onmousewheel = scrolling;
            document.onkeydown = keydown;
        }
    }

    function enableScrolling(){
        if (window.removeEventListener) {
            window.removeEventListener('DOMMouseScroll', scrolling, false);
            window.removeEventListener('touchmove',scrolling,false);
        }
        window.onmousewheel = document.onmousewheel = document.onkeydown = null;
    }
    
    //判断是否已替换，来判断是否已经构造完成
    var Loader = function(config){
        this.config = {autoshow : true, target: 'body',text:"正在加载中...",cancelable:true};
        canceled = false;
        if(config) {
            this.config = $.extend(this.config, config);
        }
        if(this.config.autoshow) {
            this.show();
        }
    };

    //change事件需要执行用户自定义事件，还要广播事件。
    Loader.prototype.show = function() {
        me = this;

        disableScrolling();
        var targetOjb = $(this.config.target);
        var cube_loader =  this.find();
        if(cube_loader) return;

        //灰色透明背景
        var loader_mask = $("<div/>").addClass("cube-loader-mask");
        var loader = $("<div/>").addClass("cube-flight-loader");
        //小飞机
        var img = $("<img/>").addClass("cube-flight-loader-flight");
        img.attr('src','../vendor/cube/images/loader_plane.png');
        //取消按钮
        var cancelImg = $('<img/>');
        cancelImg.attr('src','../vendor/cube/images/loader_cancel.png');
        var cancelBtn = $('<a/>').addClass('cube-flight-loader-cancel');
        cancelBtn.attr('href','javascript:void(0)');
        if(this.config.cancelable!=false){
            cancelBtn.bind('click',function(){
                me.hide();
                canceled = true;
            });
            
        }
        cancelBtn.append(cancelImg);
        //文字
        var text = $('<span/>').addClass("cube-loader-text");
        text.html(this.config.text);


        
        loader.append(img);
        loader.append(cancelBtn);
        loader.append(text);
    
        $(targetOjb).append(loader_mask);
        $(targetOjb).append(loader);
    };

    Loader.prototype.hide = function() {
        enableScrolling();
        var cube_loader = me.find();
        if(cube_loader){
            $(".cube-loader-mask").remove();
            $(cube_loader).remove();
        }
    };

    Loader.prototype.hideAll = function() {
        enableScrolling();
        var cube_loader = $(".cube-flight-loader");
        if(cube_loader && cube_loader.length>0) {
            $(cube_loader).each(function(){
                $(this).remove();
            });
        }
    };

    Loader.prototype.find = function() {
        var targetOjb = $(this.config.target);
        var result;
        var children = targetOjb.children();
        $(children).each(function(){
            if($(this).hasClass("cube-flight-loader")) {
                result = this;
            }
        });
        return result;
    };

    Loader.prototype.isCanceled = function(){
        return canceled;
    };
    return Loader;
});