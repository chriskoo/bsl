/*********************************************************************
* 系统名称   : 变色龙移动应用平台                                      *
* 当前版本   : V2.0.0.0                                              *
*--------------------------------------------------------------------*
* 代码名称   : fixed.js                                           *
* 业务系统   : cube框架                             *
* 代码类型   : java                                                  *
* 代码功能   : UC, QQ浏览器兼容性补丁                                     *
*                                                                    *
*--------------------------------------------------------------------*
* 创建人员   : 冯秋明                                                *
* 创建日期   : 2013050604                                              *
*--------------------------------------------------------------------*
* 变更历史   :日期   变更人  变更原因   变更内容                       *
*                                                                    *
*********************************************************************/
define(['zepto', 'backbone', 'gmu', 'cube/cache'], function($, Backbone, gmu, Cache) {

	//handle the positon for <header> in UC & QQ browser.
	var fixHeader = function() {
		$('header').css({'width':''});
        $('header .title').css({'position':'absolute'});


        $('header').css({'position':'absolute'});


        var headerWidth = $('header').css('width');
        $('header').css({'position':'fixed'});
        $('header').css({'width':headerWidth});
	};

	//handle the positon for loader in UC & QQ browser.
	var fixLoaderOn = function(){
        $(window).on('orientationchange', onFixLoaderOrientationchange);
        $(window).on('resize', onFixLoderResize);
        $(window).on('scroll', onFixLoderScroll);
	};

	var fixLoaderOff = function(){
        $(window).off('orientationchange', onFixLoaderOrientationchange);
        $(window).off('resize', onFixLoderResize);
        $(window).off('scroll', onFixLoderScroll);
	};

    function onFixLoaderOrientationchange(){
    }


    function onFixLoderResize(){
        $('.cube-flight-loader').css({'position':'absolute'});
    }

	function onFixLoderScroll(){
        $('.cube-flight-loader').css({'position':'fixed'});
    }

    //handle the positon for popover in UC & QQ browser.
    var fixPopoverOn = function(){
        $(window).on('orientationchange', onFixPopoverOrientationchange);
        $(window).on('resize', onFixPopoverResize);
        $(window).on('scroll', onFixPopoverScroll);
	};

	var fixPopoverOff = function(){
        $(window).off('orientationchange', onFixPopoverOrientationchange);
        $(window).off('resize', onFixPopoverResize);
        $(window).off('scroll', onFixPopoverScroll);
	};

    function onFixPopoverOrientationchange(){
        
    }


    function onFixPopoverResize(){
    }

	function onFixPopoverScroll(){
    }

    function fixHeaderWithPopoverOffsetTop(){
    }

	return {
		FxHeader: fixHeader,
		FixLoaderOn: fixLoaderOn,
		FixLoaderOff: fixLoaderOff,
		FixPopoverOn: fixPopoverOn,
		FixPopoverOff: fixPopoverOff,
		FixHeaderWithPopoverOffsetTop : fixHeaderWithPopoverOffsetTop
	};

});