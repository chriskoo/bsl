//init require js
require.config({
	baseUrl: '.',
	paths: {
		//plugin
		text: 'cube/vendor/text',
		domReady: 'cube/vendor/domReady',
		i18n: 'cube/vendor/i18n',
		//lib
		zepto: '__proto__' in {} ? 'cube/vendor/zepto.min' : 'cube/vendor/jquery-2.0.0',
		underscore: 'cube/vendor/underscore_amd',
		backbone: 'cube/vendor/backbone_amd',
		swipeview: 'cube/vendor/swipeview',
		bean: 'cube/vendor/bean',
		flotr2: 'cube/vendor/flotr2-amd',
		canvasloader: 'cube/vendor/canvasloader',
		gmu: 'cube/vendor/gmu',
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
		gmu: {
			deps: ['zepto']
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
	var hideAddressBar = launcher.getAttribute('hideAddressBar') == 'true';
	var preventTouchMove = launcher.getAttribute('preventTouchMove') == 'true';
	var enablePhoneGap = launcher.getAttribute('enablePhoneGap') == 'true';

	var defaultModule = launcher.getAttribute('defaultModule');
	var defaultView = launcher.getAttribute('defaultView');
	var loadMode = launcher.getAttribute('loadMode');

	var enablePad = launcher.getAttribute('enablePad');

	//load phonegap js
	if (enablePhoneGap) {
		var phonegapjs = document.createElement('script');
		phonegapjs.setAttribute('type', 'text/javascript');
		phonegapjs.setAttribute('src', '../cordova.js');
		document.head.appendChild(phonegapjs);
	}

	require(['domReady', 'zepto', 'gmu', 'cube/i18n', 'lib/fastclick', 'cube/app'], function(domReady, $, gmu, i18n, FastClick, app) {
		// domReady(function() {
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

			app.initialize({
				defaultModule: defaultModule,
				defaultView: defaultView,
				enablePad: enablePad,
				loadMode: loadMode
			});

			$('html').css('min-height', window.screen.availHeight - 44 + "px");
			// $('html').css('min-height', window.innerHeight);

		}

		if (enablePhoneGap && navigator.userAgent.match(/(iPad|iPhone|Android)/)) {
			// This is running on a device so waiting for deviceready event
			document.addEventListener('deviceready', onDeviceReady, false);

		} else {
			// On desktop don't have to wait for anything
			onDeviceReady(true);
		}
		// }); //domReady
	});

})();