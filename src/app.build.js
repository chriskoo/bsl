({
    appDir: ".",
    baseUrl: ".",
    dir: 'build',

    inlineText: true,

    paths: {

        i18n: 'vendor/i18n',
        text: 'vendor/text',

        domReady: "empty:",
        zepto: "empty:",
        'iscroll': "empty:",
        'iscroll.lite': "empty:",
        swipeview: "empty:",
        underscore: "empty:",
        backbone: "empty:",
        bean: "empty:",
        flotr2: "empty:",

        lib: 'vendor',
        cube: 'js',

        "lib/backbone_amd": "empty:",
        "lib/bean": "empty:",
        "lib/domReady": "empty:",
        "lib/fastclick": "empty:",
        "lib/flotr2-amd": "empty:",
        "lib/i18n": "empty:",
        "lib/iscroll-lite": "empty:",
        "lib/iscroll": "empty:",
        "lib/jquery-1.9.1": "empty:",
        "lib/mdatepicker": "empty:",
        "lib/require": "empty:",
        "lib/require.min": "empty:",
        "lib/swipeview": "empty:",
        "lib/text": "empty:",
        "lib/underscore_amd": "empty:",
        "lib/uuid": "empty:",
        "lib/zepto": "empty:"
    },

    optimize: "uglify",

    uglify: {
        toplevel: true,
        ascii_only: true,
        beautify: false,
        max_line_length: 10000,

        defines: {
            DEBUG: ['name', 'false']
        },
        no_mangle: false
    },

    optimizeCss: "standard",

    modules: [{
            name: "js/cube"
        }
    ]

})