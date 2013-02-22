require.config({
    'urlArgs': "bust="+Date.now(), // fix caching troubles
    'paths': {
        "bootstrap": "../lib/bootstrap/js/bootstrap",
        "codemirror": "../lib/codemirror-3.0/lib/codemirror",
        "jquery": "../lib/jquery",
        "mustache": "../lib/mustache",
        "underscore": "../lib/underscore-min",
        "jquery-ui": "../lib/jquery-ui-1.10.0.custom/js/jquery-ui-1.10.0.custom.min",
        "backbone": "../lib/backbone",
        "jsdiff": "../lib/jsdiff",
        "spin": "../lib/spin",
        "mousewheel": "../lib/jquery-mousewheel"
    },
    'shim': {
        'codemirror': {
            deps:['jquery'],
            exports:'CodeMirror'
        },
        'backbone': {
            deps:['jquery','underscore'],
            exports:'Backbone'
        },
        'bootstrap': {
            deps:['jquery','jquery-ui']
        },
        'underscore': {
            deps:[],
            exports:'_'
        }
    }
});

require(
    [
        "jquery",
        "geometry",
        'events',
        "bootstrap",
        "mustache",
        "underscore",
        "jquery-ui",
        "backbone",
        "codemirror",
        "toolbar",
        "facsimile",
        "editor",
        "router",
        "spin",
        "spinner",
        "page",
        "mousewheel",
        "language",
        "bibinfo",
        'container',
        'boxes',
        'compatibility',
        'dialog'
    ], function($, geometry,events) {

        try {
            console.log;
        } catch (err) {
            console = {
                log: function() {},
                trace: function() {}
            };
        }

        $(document).ready(function() {

            events.trigger('appReady');

        });
});
