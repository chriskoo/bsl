
/*
 * 列表组件，最终转换出html5
 * <div id="passenger-list">
 *  <div class="contentScroller">
 *  </div>
 * </div>
 *
 */
define(['zepto', 'underscore', 'cube/loader', 'cube/cache', 'gmu', 'backbone'], function($, _, Loader, Cache, gmu, Backbone) {

    var List = Backbone.View.extend({

        tagName: 'div',
        //渲染组件时，此组件所在上下文，可能未attach到document，所以一些元素查找，需要在上下文内查找，例如itemTemplate
        elContext: document,

        events: {
            // "": "reload"
            "click .cube-list-item": "onItemSelect"
        },

        requestParams: {},

        config: {
            /*提取到父类*/
            observers: [],
            /*自有*/
            width:'100%',
            height:'500',
            autoLoad: "true",
            pageParam: 'page',
            pageSizeParam: 'pageSize',
            topOffset: 40,
            page: 1,
            pageSize: 10,
            pullDownEnable: false,
            isPullDownRefresh: false,
            pagingEnable: true,
            iScroll: false,
            method: 'GET',
            filterStr: null,
            momentum:true
        },

        request: null,

        initialize: function() {
            var me = this;
            //获取传入参数
            if (arguments && arguments.length > 0) {
                var config = arguments[0];
                //这样取得的config将会被几个list共享
                // this.config = _.extend(this.config, object);

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

            //iScroll
            if (this.config.iScroll != 'false') {
                var list_iScroll = new iScroll(this.el, {
                    onBeforeScrollStart: function(e) {
                        var target = e.target;
                        while (target.nodeType != 1) target = target.parentNode;
                        if (target.tagName != 'TEXTAREA' && target.tagName != 'INPUT' && target.tagName != 'SELECT') e.preventDefault();
                    },
                    topOffset:config.topOffset,
                    useTransition: true,
                    onRefresh: function() {
                        pullUpEl = me.$('#pullUp')[0];
                        if (pullUpEl != null) {
                            pullUpOffset = pullUpEl.offsetHeight;
                            if (pullUpEl.className.match('loading')) {
                                pullUpEl.className = '';
                                pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
                            }
                        }
                    },
                    onScrollMove: function() {
                        Cache.put("onScrollMove", "true");
                        pullUpEl = me.$('#pullUp')[0];
                        if (pullUpEl != null) {
                            // console.log('Release = *******************'+this.maxScrollY);
                            pullUpOffset = pullUpEl.offsetHeight;

                            var pullUpReloadHeight = 5;
                            if (this.y < (this.maxScrollY - pullUpReloadHeight) && !pullUpEl.className.match('flip')) {
                                pullUpEl.className = 'flip';
                                pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Release to refresh...';
                                //this.maxScrollY = this.maxScrollY;
                            } else if (this.y > (this.maxScrollY + pullUpReloadHeight) && pullUpEl.className.match('flip')) {
                                pullUpEl.className = '';
                                pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
                                //this.maxScrollY = pullUpOffset;
                            }

                            
                            var pullDownRefreshHeight = 40;
                            pullDownRefreshEl = me.$('#PullDownRefresh')[0];
                            if (pullDownRefreshEl) {
                                if((this.y > pullDownRefreshHeight)&&(this.options.topOffset>0)){

                                    this.options.topOffset=0;
                                    $(pullDownRefreshEl).find('#pullDownRefreshIcon').attr({'class':'pullDownIn'});
                                    $(pullDownRefreshEl).find('#pullDownRefreshLable').text('Release to reload...');
                                    $(me.$('#pullDownRefreshIconWarp')[0]).addClass('pullDownFlip180');



                                }else if((this.y < pullDownRefreshHeight)&&(this.options.topOffset==0)){
                                    this.options.topOffset = parseInt($(pullDownRefreshEl).css('height'));
                                    $(pullDownRefreshEl).find('#pullDownRefreshIcon').removeClass('pullDownOut').addClass('pullDownIn');
                                    $(pullDownRefreshEl).find('#pullDownRefreshLable').text('Pull down to reload...');
                                    Cache.put("onScrollMove","false");
                                    $(me.$('#pullDownRefreshIconWarp')[0]).removeClass('pullDownFlip180');

                                }else if(this.y > 0){
                                    Cache.put("onScrollMove","false");

                                }
                            }

                        }
                    },
                    onBeforeScrollEnd: function(){
                        pullDownRefreshEl = me.$('#PullDownRefresh')[0];

                        if((pullDownRefreshEl!=null)&&(this.options.topOffset == 0)){
                                $(pullDownRefreshEl).find('#pullDownRefreshIcon')
                                    .removeClass('pullDownIn')
                                    .addClass('pullDownOut');
                                $(pullDownRefreshEl).find('#pullDownRefreshLable').text('Reloading...');
                                this.refresh();

                        }
                        // 
                    },
                    onScrollEnd: function() {

                        pullUpEl = me.$('#pullUp')[0];
                        if (pullUpEl != null) {
                            pullUpOffset = pullUpEl.offsetHeight;

                            if (pullUpEl.className.match('flip')) {
                                pullUpEl.className = 'loading';
                                pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Loading...';
                                me.config.page = me.config.page + 1;
                                me.loadNextPage();

                                Cache.put("onScrollMove","false");
                            }
                        }

                        pullDownRefreshEl = me.$('#PullDownRefresh')[0];
                        if((pullDownRefreshEl!=null)&&(this.options.topOffset == 0)){
                                var that = this;

                                $(pullDownRefreshEl).find('#pullDownRefreshIcon').attr({'class':'pullDownOut'});
                                me.loadNextPage(function(){
                                    Cache.put("onScrollMove","false");
                                    $(pullDownRefreshEl).find('#pullDownRefreshLable').text('Pull down to refresh...');
                                    that.options.topOffset = parseInt($(pullDownRefreshEl).css('height'));
                                    $(pullDownRefreshEl).find('#pullDownRefreshIcon').attr({'class':'pullDownIn'});
                                    $(me.$('#pullDownRefreshIconWarp')[0]).removeClass('pullDownFlip180');
                                    that.refresh();
                                    
                                });
                                


                        }

                    }

                });

                this.iScroll = list_iScroll;
            }

            if (this.config.autoLoad == 'true') this.reload();
        },

        onItemSelect: function(e) {
            if(Cache.get("onScrollMove")=="true"){
                Cache.put("onScrollMove","false");
                return;
            }

            var target = e.currentTarget;

            var data = null;

            var index = target.getAttribute('index');
            var CACHE_ID = 'cube-list-' + this.config['id'];
            if (Cache.get(CACHE_ID)) {
                var olddata = Cache.get(CACHE_ID);
                data = olddata[index];
            }
            // var nodeName = e.toElement.nodeName;
            var nodeName = e.toElement != null ? e.toElement.nodeName : e.target.nodeName;
            if (this.shouldPreventListEvent(nodeName)) {
                this.trigger("List:select", this, data, index);
                //list, record(include event)
                this.trigger("select", this, {
                    data: data,
                    index: index,
                    event: e
                });
            }
        },

        render: function() {
            this.reload();
            return this;
        },

        reload: function() {
            this.config.page = 1;
            this.loadNextPage();
        },

        setRequestParams: function(params) {
            this.requestParams = _.extend(this.requestParams, params);
            this.reload();
        },

        filterChildren: function(keyWord) {
            var contentScroller = this.$(".contentScroller");
            if (this.iScroll) this.iScroll.scrollTo(0, 0);
            if (keyWord) {
                contentScroller.find("li[filter-keyword]").hide();
                this.$('#' + this.config['id'] + ' li[filter-keyword*="' + keyWord.toLowerCase() + '"]').show();
            } else {
                contentScroller.find("li[filter-keyword]").show();
            }
            if (this.config.iScroll != 'false') this.iScroll.refresh();
        },
        refreshIscroll: function() {
            if (this.config.iScroll != 'false') this.iScroll.refresh();
        },

        shouldPreventListEvent: function(nodeName) {
            if (nodeName != 'TEXTAREA' && nodeName != 'INPUT' && nodeName != 'SELECT') return true;
            else return false;
        },

        loadListByJSONArray: function(jsonArray) {
            var me = this;
            //加载搜索栏
            if (me.config.page == 1) {
                me.clearList();
            }

            if (jsonArray === null || jsonArray.length === 0) {
                if (me.$('.cube-list-item-more-record').length === 0) {
                    var li = $("<li/>");
                    li.addClass('cube-list-item-more-record');
                    li.html('无相关记录');
                    li.appendTo(me.el.querySelector('.contentScroller .item-content'));
                    $('#pullUp').remove();
                    console.log("cube---list---list: 没有数据");
                }
                return;
            }


            //把数组数据存起来
            var cache_data = jsonArray;
            var CACHE_ID = 'cube-list-' + me.config['id'];
            //修改一个bug 当page大于1时才append数据 否则不append
            if (Cache.get(CACHE_ID) && me.config['page'] > 1) {
                var olddata = Cache.get(CACHE_ID);
                cache_data = olddata.concat(jsonArray);
            }

            Cache.put(CACHE_ID, cache_data);

            var skarry;
            var _itemTemplateName = this.config['_itemTemplate'];
            var paging = this.config['paging'];
            var templateStr;
            if (_itemTemplateName) templateStr = $(this.elContext).find("#" + _itemTemplateName).html();
            if (me.config['searchkeys']) {

                skarry = me.config['searchkeys'].split(",");
            }
            for (var i = 0; i < jsonArray.length; i++) {
                var item = jsonArray[i];
                // item.index = i;
                var li = $("<li/>");
                li.addClass('cube-list-item');
                li.attr('index', (me.config['page'] - 1) * me.config['pageSize'] + i);

                //为每一个li加上过滤的关键字
                if (skarry) {
                    var fkword = "";
                    for (var j = 0; j < skarry.length - 1; j++) {
                        if (jsonArray[i][skarry[j]]) {

                            fkword = fkword + jsonArray[i][skarry[j]] + " ";
                        }
                    }
                    
                    if (jsonArray[i][skarry[skarry.length - 1]]) {

                        fkword = fkword + jsonArray[i][skarry[skarry.length - 1]];
                    }
                    li.attr('filter-keyword', fkword.toLowerCase());
                }
                
                if (_itemTemplateName) li.append(_.template(templateStr, item));
                //TODO: 需要重构
                li.appendTo(me.el.querySelector('.contentScroller .item-content'));
            }

            //更多按钮
            var moreEl = this.el.querySelector('.cube-list-item-more');
            if (moreEl) this.$(moreEl).remove();

            //判断页数决定是否显示更多按钮
            if (paging == 'true' && me.config['pageSize'] == jsonArray.length) {
                //加上一个加载更多的cell
                var moreLi = $("<li/>");
                moreLi.addClass('cube-list-item-more');
                //TODO: 需要重构
                moreLi.appendTo(me.el.querySelector('.contentScroller'));

                var pullUpText = "<div class='' id='pullUp'><span class='pullUpIcon'></span><span class='pullUpLabel'>Pull up to load more...</span></div>";
                var defalutMoreItemDiv = $(pullUpText);
                moreLi.append(defalutMoreItemDiv);
            } else if (paging !== undefined) {
                var li = $("<li/>");
                li.addClass('cube-list-item-more-record');
                li.html('无更多相关记录');
                $('#pullUp').remove();
                li.appendTo(me.el.querySelector('.contentScroller .item-content'));
            }
            me.trigger("drawed", me, jsonArray);
            // me.config.page = me.config.page + 1;
            if (me.config.iScroll != 'false') {
                me.iScroll.refresh();
            }
        },

        clearList: function() {
            //clear list
            var contentScroller = this.$(".contentScroller");
            var content_holder = contentScroller.find('.item-content');

            if (this.config['page'] == 1) {
                content_holder.find("li").remove();
            }
        },

        loadNextPage: function(callback) {
            console.log('cube---list---list:load  begin');
            var me = this;
            var loader;

            me.requestParams[me.config.pageParam] = this.config['page'];
            me.requestParams['pageSize'] = this.config['pageSize'];
            var _itemTemplateName = this.config['_itemTemplate'];
            if (!me.config['url']) return;
            if (me.config.loaderText) {
                loader = new Loader({
                    text: me.config.loaderText
                });
            } else {
                loader = new Loader({
                    text: "查询中..."
                });
            }

            $.ajax({
                block: true,
                timeout: 20 * 1000,
                traditional: true,
                url: me.config['url'],
                type: me.config['method'],
                data: me.requestParams,
                dataType: "json",
                beforeSend: function(xhr, settings) {
                    console.log('cube---list---list: request data...');
                    if (me.request) {
                        me.request.abort();
                    }
                    me.request = xhr;
                },
                complete: function() {
                    me.request = null;
                    me.refreshIscroll(me);
                    if(callback){
                        callback();
                    }
                },
                success: function(data, textStatus, jqXHR) {
                    console.log('cube---list---列表数据加载成功：' + textStatus + " response:[" + data + "]");
                    me.trigger("load", me, data);

                    var jsonRoot = data;
                    if (me.config.jsonRoot) {
                        _.each(me.config['jsonRoot'].split('.'), function(element) {
                            jsonRoot = jsonRoot[element];
                        });
                    }

                    //编译模板
                    var templateStr;
                    if (_itemTemplateName) templateStr = this.$("#" + _itemTemplateName).html();

                    //append
                    console.log("cube---list---"+jsonRoot.length + ' records in total');

                    me.loadListByJSONArray(jsonRoot);


                    if (me.config['filterStr']) {
                        me.filterChildren(me.config['filterStr']);
                    }
                    //update current number

                    me.trigger("loaded", me, data);
                    loader.hide();
                    console.log('cube---list---list:load and draw  end');

                },
                error: function(e, xhr, type) {
                    me.config.page = me.config.page - 1;
                    console.error('cube---list---列表数据加载失败：' + e + "/" + type + "/" + xhr);
                    loader.hide();
                }
            });
        }

    }, {
        parseConfig: function(element, attNameList) {

            var jqObject = $(element);

            var config = {};
            for (var i = 0; i < attNameList.length; i++) {
                var key = attNameList[i];
                var value = jqObject.attr(key);
                if (value) config[key] = value;
            }

            return config;
        },

        compile: function(elContext) {
            var me = this;
            return _.map($(elContext).find("list"), function(tag) {
                console.log('cube---list---list:compile');
                var config = me.parseConfig(tag, ['id', 'itemTemplate', '_itemTemplate', 'moreItemElement', 'url', 'method', 'jsonRoot', 'class', 'paging', 'iScroll', 'isPullDownRefresh', 'autoLoad', 'pageParam', 'searching', 'searchkeys', 'filterStr', 'pageSize', 'skin', 'loaderText', 'searchText', 'width', 'height','additionHeight']);

                //build html
                //<div id="{id}">
                //  <div class="contentScroller">
                //    <div class="item-content">
                //    </div>
                //  </div>
                //</div>
                var list_el = document.createElement('div');
                list_el.setAttribute('id', config.id);
                list_el.setAttribute('data-component', 'list');
                if (config.skin) {
                    list_el.setAttribute('class', 'cube-list-' + config.skin);
                } else {
                    list_el.setAttribute('class', 'cube-list-nostyle');
                }


                this.$(list_el).css('height', '100%');
                //整体滚动容器
                var scroller_el = document.createElement('ul');
                this.$(scroller_el).addClass('contentScroller');
                list_el.appendChild(scroller_el);


                var listContainer = document.createElement('div');
                if (config.height) {
                    $(listContainer).attr('style','height:'+config.height+'px;');
                }else{

                    $(listContainer).attr('style','height:600px;');
                }
                // listContainer.setAttribute('id', 'aaaaaaa');

                var pullDownRefreshDiv;
                if(config.isPullDownRefresh=='true'){
                    //var background-image=
                    pullDownRefreshDiv = document.createElement('div');
                    $(pullDownRefreshDiv).attr('id','PullDownRefresh');
                    $(pullDownRefreshDiv).attr('style','height: 40px;');
                    $(pullDownRefreshDiv).append('<span id="pullDownRefreshIconWarp"><span id="pullDownRefreshIcon"></span></span><span id="pullDownRefreshLable">Pull down to refresh...</span>');
                    

                    
                        // $(pullDownRefreshDiv).addClass('pullDownFlip');
                     // $(list_el).prepend(pullDownRefreshDiv);
                    // $(listContainer).appendChild(pullDownRefreshDiv);
                }



                //item容器（方便在header和footer之间找到正确位置插入数据行）
                var content_el = document.createElement('div');
                this.$(content_el).addClass('item-content');
                scroller_el.appendChild(content_el);

                 $(list_el).wrap(listContainer);
                 $(list_el).find("div ul").prepend(pullDownRefreshDiv);

                //replace with html
                this.$(tag).replaceWith(listContainer);



                config['el'] = list_el;
                var pullDownRefreshHeight = parseInt($(pullDownRefreshDiv).css('height'));
                config['topOffset']= pullDownRefreshHeight? pullDownRefreshHeight :0;
                config.elContext = elContext;

                var list = new List(config);

                // $(list_el).refresh({ready:function(){}})；
                Cache.put(config.id+'Onload',0);
                function listSizeFix(){
                    var bodyHeight = $(window).height();
                    var currentTop = $(listContainer).offset().top;
                    var finalHeight = bodyHeight - currentTop;

                    if(config.height){
                        finalHeight = config.height;
                    }

                    if(config.additionHeight){
                        finalHeight = finalHeight+parseInt(config.additionHeight);
                    }

                    $('html').css({'min-height':currentTop})
                    $('body').find(listContainer).css({'height':((finalHeight)+'px')})
                        
                    $('.cube-list-item-more-record').css({'border-bottom':'0px'});

                }
                var timer=setInterval(function(){
                if($('body').find(listContainer).length>0){
                        //do something
                        listSizeFix();
                    }


                var onloadCounter =parseInt(Cache.get(config.id+'Onload'))+1;
                if(onloadCounter==1){
                    $(window).on('resize', listSizeFix);
                    $(listContainer).unload(function(){
                        $(window).off('resize', listSizeFix);
                    })

                }
                if(onloadCounter>1&&$('body').find(listContainer).length==0){
                    clearInterval(timer);
                    console.log('cube---list---end');
                }else{
                    Cache.put(config.id+'Onload',onloadCounter);
                }
            },500)


                return list;
            });
        }
    });

    return List;
});