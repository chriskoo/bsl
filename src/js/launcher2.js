//init require js
require.config({
	baseUrl: '../',
	paths: {
		//plugin
		text: 'cube/vendor/text',
		domReady: 'cube/vendor/domReady',
		i18n: 'cube/vendor/i18n',
		//lib
		zepto: '__proto__' in {} ? 'cube/vendor/zepto' : 'cube/vendor/jquery-1.9.1',
		underscore: 'cube/vendor/underscore_amd',
		backbone: 'cube/vendor/backbone_amd',
		'iscroll': 'cube/vendor/iscroll',
		'iscroll.lite': 'cube/vendor/iscroll-lite',
		swipeview: 'cube/vendor/swipeview',
		bean: 'cube/vendor/bean',
		flotr2: 'cube/vendor/flotr2-amd',
		pageslide: 'vendor/lib/jquery.pageslide',
		//path
		lib: 'cube/vendor',
		cube: 'cube/js'
	},
	shim: {
		backbone: {
			deps: ['underscore']
		},
		zepto: {
			exports: '$'
		},
		'iscroll': {
			exports: 'iScroll'
		},
		'iscroll.lite': {
			exports: 'iScroll'
		},
		swipeview: {
			exports: 'SwipeView'
		}
	}
});

//i18n
if (window.localStorage['lang'] === undefined) window.localStorage['lang'] = "zh-cn";
requirejs.config({
	config: {
		i18n: {
			locale: window.localStorage['lang']
		}
	}
});

(function() {

	var launcher = document.querySelector("meta[name='launcher']");
	var module = launcher.getAttribute('module');
	var hideAddressBar = launcher.getAttribute('hideAddressBar') == 'true';
	var preventTouchMove = launcher.getAttribute('preventTouchMove') == 'true';
	var enablePhoneGap = launcher.getAttribute('enablePhoneGap') == 'true';

	//load phonegap js
	if (enablePhoneGap) {
		var phonegapjs = document.createElement('script');
		phonegapjs.setAttribute('type', 'text/javascript');
		phonegapjs.setAttribute('src', '../cordova.js');
		document.head.appendChild(phonegapjs);
	}

	require(['domReady', 'cube/i18n', 'lib/fastclick', 'cube/app'], function(domReady, i18n, FastClick, app) {
		domReady(function() {

			//remove loading screen
			$('#appLoadingIndicator').remove();

			//ensure view can scroll to top for ios devices
			$('html').css('min-height', window.screen.availHeight - 44 + "px");

			//remove 300ms delay
			new FastClick(document.body);
			//hide address bar
			if (hideAddressBar) setTimeout(function() {
				window.scrollTo(0, 1);
			}, 0);
			if (preventTouchMove) document.addEventListener('touchmove', function(e) {
				e.preventDefault();
			}, false);

			function onDeviceReady(desktop) {

				// Hiding splash screen when app is loaded
				window.isDesktop = desktop;

				app.initialize(module);
			}

			if (enablePhoneGap && navigator.userAgent.match(/(iPad|iPhone|Android)/)) {
				// This is running on a device so waiting for deviceready event
				document.addEventListener('deviceready', onDeviceReady, false);

			} else {
				// On desktop don't have to wait for anything
				onDeviceReady(true);
			}
		}); //domReady
	});

})();