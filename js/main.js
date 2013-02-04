var $templates;

require.config({
    'paths': {
        "bootstrap": "../lib/bootstrap/js/bootstrap",
        "codemirror": "../lib/codemirror-3.0/lib/codemirror",
        "jquery": "../lib/jquery",
        "mustache": "../lib/mustache",
        "underscore": "../lib/underscore-min",
        "jquery-ui": "../lib/jquery-ui.min",
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
        "pageselector",
        "mousewheel",
        "language",
        "bibinfo",
        'save',
        'container',
        'boxes',
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

        $.get('templates.html',function(html) {
            $templates = $(html);
            $(document).ready(function() {

                Backbone.history.start();

                events.trigger('appReady');
            });
        });
});
