require.config({
    'urlArgs': "bust="+Date.now(), // fix caching troubles
    'paths': {
        "bootstrap": "../lib/bootstrap/js/bootstrap",
        "codemirror": "../CodeMirror/lib/codemirror",
        "jquery": "../lib/jquery",
        "base64": "../lib/base64",
        "mustache": "../lib/mustache",
        "underscore": "../lib/underscore-min",
        "jquery-ui": "../lib/jquery-ui-1.10.0.custom/js/jquery-ui-1.10.0.custom.min",
        "jquery-appear": "../lib/jquery-appear",
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
        "jquery-appear",
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
        'dialog',
        'browser',
        'document',
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
