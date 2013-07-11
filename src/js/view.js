/*********************************************************************
* 系统名称   : 变色龙移动应用平台                                         *
* 当前版本   : V2.0.0.0                                                  *
*--------------------------------------------------------------------*
* 代码名称   : fixed.js                                              *
* 业务系统   : cube框架                                                *
* 代码类型   : java                                                      *
* 代码功能   : UC, QQ浏览器兼容性补丁                                     *
*                                                                    *
*--------------------------------------------------------------------*
* 创建人员   : 变色龙一期人员                                               *
* 创建日期   : 变色龙一期                                                 *
*--------------------------------------------------------------------*
* 变更历史   :                                                       *
*日期      20130604                                                 *
*变更人     冯秋明                                                  *
*变更原因   该控件在移动设备旋转的时候，位置会有偏移                         *
*变更内容   在该控件显示的时候，在浏览器添加旋转监听，调用fixed.js中的FixLoaderOn()*
*          从而修正其控件的位置                                         *   
*                                                                    *                   
*                                                                    *                      
*                                                                    *
*********************************************************************/
define(['zepto', 'underscore', 'backbone', 'cube/list', 'cube/calendar', 'cube/segment', 'cube/carousel', 'cube/extendable-list', 'cube/session','cube/base64Img','cube/fixed'],
    function($, _, Backbone, List, Calendar, Segment, Carousel, ExtendableList, Session, Base64Img,Fixed){

    // Cached regex to split keys for `delegate`.
    var delegateEventSplitter = /^(\S+)\s*(.*)$/;
    var CubeView = Backbone.View.extend({
        className: 'page',
        components: {},
        compile: function(){
            var me = this;
            var lists = List.compile(this.el);
            var segments = Segment.compile(this.el);
			var calendars = Calendar.compile(this.el);
            var carousels = Carousel.compile(this.el);
            var extendableLists = ExtendableList.compile(this.el);
            var base64img = Base64Img.compile(this.el);
            var result = _.union(lists, segments,carousels,extendableLists);
            _.each(result, function(component){
                var id = component.id || component.el.getAttribute('id');
                me.components[id] = component;
            });

            //native transition enhancement
            $('a[cube-action]').each(function(index, element){
                console.log(element);
                var href = element.getAttribute('href');
                var action = element.getAttribute('cube-action');
                if (!href) href="";
                if(href && href.indexOf("?")>=0) {
                    href = href+"&cube-action="+action;
                } else {
                    href = href+"?cube-action="+action;
                }
                $(element).removeAttr("cube-action");
                element.setAttribute('href', href);
            });

            //back button intercept
            this.$el.find('.back').click(function(){
                window.history.back();
                return false;
            });

            this.checkDependences();
        },

        //binding events for cube components
        bindEvents: function(){
            if (!this.bindings) return;

            for(var key in this.bindings){
                var method = this.bindings[key];
                if (!_.isFunction(method)) method = this[method];
                if (!method) throw new Error('Method "' + this.bindings[key] + '" does not exist');
                var match = key.match(delegateEventSplitter);
                var eventName = match[1], componentId = match[2];
                method = _.bind(method, this);
                var comp = this.component(componentId);
                if (comp) comp.on(eventName, method, this);
            }
        },
        unbindEvents: function(){
            for(var key in this.bindings){
                var match = key.match(delegateEventSplitter);
                var eventName = match[1], componentId = match[2];
                var comp = this.component(componentId);
                if (comp) comp.off(eventName);
            }
        },

        //get component instance
        component: function(id){
            return this.components[id];
        },

        initialize: function(){
            Backbone.View.prototype.initialize.call(this);
        },

        remove: function(){
            $(window).off('orientationchange', this.onOrientationchange);
            this.unbindEvents();
            Backbone.View.prototype.remove.call(this);
        },


        render: function(){
            var self = this;
            $(document).bind('show', function(){
                self.onShow();
            });

            this.compile();
            this.unbindEvents();
            this.bindEvents();
            return this;
        },

        onShow: function(){
             $(window).on('orientationchange', this.onOrientationchange);
             $(window).on('resize', this.onWindowResize);
             $(window).on('scroll',this.onWindowScroll);
             $('body').css({'width':'100%'});
             window.scroll(0,0);
        },

        onWindowScroll: function(){
           // $('header').css({'position':'fixed'});
            console.log('window scroll');
        },

        onOrientationchange: function(){
            console.log('window orientationchange');
            $('input').blur();
        },


        onWindowResize:function(){

//
            Fixed.FxHeader();

            console.log('window onWindowResize');

        },

        //proxy method for page navigation
        navigate: function(fragment, options){
            fragment = this._modularFragment(fragment);
            console.log('navigate to: ' + fragment);
            Backbone.history.navigate(fragment, options);
        },

        _modularFragment: function(fragment){
            /*modular support*/
            //this is a modular view(depends on the router), and the navigation path not start with slash,
            //we append module id in front of it
            if (this.module && fragment[0] !== '/') {
                fragment = this.module + '/' + fragment;
            //this is a modualr view, start with slash, means that your are using absolute path, 
            //so we don't append module id, but remove the slash
            } else if (this.module) {
                fragment = fragment.substring(1);
            }
            return fragment;
        },

        checkDependences: function(){
            if(this.dependences && $.isArray(this.dependences)){
                var dependences = this.dependences;
                for(var i = 0; i < dependences.length; i++){
                   var dependence = Session.loadObject(dependences[i]);
                   if(!dependence){
                        this.missingDependence(dependences[i]);
                        window.location.href = "../"+dependences[0];
                   }
                }
            }
        }
    });

    return CubeView;
});