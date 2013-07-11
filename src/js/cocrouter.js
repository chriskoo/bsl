define(['require', 'underscore', 'backbone', 'cube/mainview', 'cube/loader', 'cube/util'], function(require, _, Backbone, MainView, Loader, Util) {
	//a CoC router
	var CoCRouter = Backbone.Router.extend({

		//load mode: app, module, view
		loadMode: 'view',
		urls: [],
		//排前面优先？
		routes: {
			//eg: index.html
			'': 'index',
			//eg: index.html#com.foss.demo/listView
			//eg: index.html#com.foss.demo/listView?t=push
			"*module/*page(?t=:timestamp)": "modularRoute",
			//eg: index.html#listView
			"*page(?t=:timestamp)": "pageRoute"
		},

		initialize: function(options) {
			var me = this;
			// window.onpopstate = function(e) {
			// 	if (e.state !== null) {
			// 		console.info(e);
			// 		console.info('history.back()');
			// 		console.info(window.location.href);
			// 		console.info(me.urls);
			// 		var u = me.urls[me.urls.length - 2];
			// 		console.info('=======' + u);
			// 		Backbone.history.navigate(u, {
			// 			trigger: true,
			// 			replace: true
			// 		});
			// 	}

			// };
			if (options) {
				this.delegate = options.delegate;
				if (options.loadMode) this.loadMode = options.loadMode;
				this.defaultModule = options.defaultModule;
				this.defaultView = options.defaultView;
				this.enablePad = options.enablePad;
			}
		},

		index: function() {
			this.modularRoute(this.defaultModule, this.defaultView);
		},

		_loadViewByApp: function(module, view, success, fail) {
			require([module + '/' + view], function(ViewClass) {
				var v = new ViewClass();
				v.module = module;
				success(v);
			}, function(err) {
				fail(err);
			});

		},

		_loadViewByModule: function(module, moduleName, view, success, fail) {
			require([module + "/" + moduleName], function(Module) {
				var ViewClass;
				if (view === null || view === '') {
					ViewClass = Module['default'];
				} else {
					ViewClass = Module[view];
				}

				var v = new ViewClass();
				v.module = module;

				success(v);

			}, function(err) {
				fail(err);
			});
		},


		_loadViewByView: function(module, view, success, fail) {
			require([module + '/' + view], function(ViewClass) {
				var v = new ViewClass();
				v.module = module;
				success(v);
			}, function(err) {
				fail(err);
			});
		},

		modularRoute: function(module, view, timestamp) {

			console.log('mr:' + module + '/' + view + '/' + timestamp);

			var me = this;

			var require_path = module + '/' + (view === null ? '' : view);

			var url_path;

			var loader;
			var viewLoaded;
			var moduleName;

			//判断是否开启pad页面
			if (this.enablePad === "true") {
				console.info("enablePad === true");
				//判断浏览器，如果是平板，则加载平板模块文件
				if (Util.browser.versions.apad || Util.browser.versions.iPad) {
					viewLoaded = require.defined(module + "/modulePad");
					moduleName = "modulePad";
				} else {
					viewLoaded = require.defined(module + "/module");
					moduleName = "module";
				}
			} else {
				viewLoaded = require.defined(module + "/module");
				moduleName = "module";

				if (!viewLoaded) {
					//TODO: show loading
					loader = new Loader({
						text: '加载中...'
					});
				}
			}

			//判断是否存在

			// if (!timestamp) {
			// 	url_path = require_path + '?t=' + Util.generateTimeStamp();
			// 	//如果时间戳为空、可被表示为新开页面，为url加上timestamp，存入栈，并且push
			// 	Backbone.history.navigate(url_path, {
			// 		trigger: false,
			// 		replace: true
			// 	});
			// 	console.log('mr2:' + window.location.href);

			// 	var loader;
			// 	var viewLoaded = require.defined(module + "/module");

			// 	if (!viewLoaded) {
			// 		//TODO: show loading
			// 		loader = new Loader({
			// 			text: '加载中...'
			// 		});
			// 	}

			// } else {
			// 	url_path = require_path + '?t=' + timestamp;
			// 	//如果访问过，则进行
			// 	var url_index = _.indexOf(this.urls, url_path);
			// 	if (url_index > -1) {
			// 		this.urls.pop(url_path);
			// 		me.delegate.pop();
			// 		console.log(me.urls);
			// 		return;
			// 	}
			// 	console.info(url_index);
			// 	console.info(this.urls);
			// }

			// //添加进栈
			// this.urls.push(url_path);


			function success(viewInstance) {
				//如果是第一个，则是直接跳转，不需要push
				// if (me.urls.length > 1) {
				// 	me.delegate.push(viewInstance);
				// } else {
				// 	me.delegate.changePage(viewInstance, module);
				// }

				//只是采用changePage
				me.delegate.changePage(viewInstance, module);
				if (loader !== undefined) {
					loader.hide();
				}
				// console.info(me.urls);
			}

			function fail(err) {
				if (loader !== undefined) {
					loader.hide();
				}
				// var failedId = err.requireModules && err.requireModules[0];
				console.log('load fail: ' + err.message);
			}

			switch (this.loadMode) {
				case 'app':
					throw new Error('app scope router not implement yet');
				case 'module':
					this._loadViewByModule(module, moduleName, view, success, fail);
					break;
				case 'view':
					this._loadViewByView(module, view, success, fail);
					break;
				default:
					throw new Error('missing loadMode');
			}
		},

		pageRoute: function(page, timestamp) {
			console.log('page route to:' + page);
		}

	});

	return CoCRouter;
});