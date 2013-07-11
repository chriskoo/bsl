//require:fixtrue.json 用require.toUrl
//定义一个接入点，可以预先依赖的模块
define(['zepto', 'backbone', 'cube/mainview', 'cube/cocrouter'], function($, Backbone, MainView, CoCRouter) {

  var init = function(options) {

    var mainview = new MainView();

    var router = new CoCRouter({
      delegate: mainview,
      defaultModule: options.defaultModule,
      enablePad: options.enablePad,
      defaultView: options.defaultView,
      loadMode: options.loadMode
    });

    var rootPath = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/'));
    console.log('start watch history, rootPath: ' + rootPath);
    Backbone.history.start({
      pushState: false,
      root: rootPath
    });

    $("#appLoadingIndicator").remove();
    $("body,html").css('background-color', 'white');
  };

  return {
    initialize: init
  };
});