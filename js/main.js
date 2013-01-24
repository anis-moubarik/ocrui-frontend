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
        "bootstrap",
        "mustache",
        "underscore",
        "jquery-ui",
        "backbone",
        "codemirror",
        "ocrui",
        "toolbar",
        "facsimile",
        "editor",
        "vkeyboard",
        "router",
        "geometry",
        "spin",
        "spinner",
        "pageselector",
        "mousewheel",
        "language",
        "bibinfo",
    ], function($, bootstrap,mustache, underscore, jqueryui, backbone, codemirror, ocrui, toolbar, facsimile, editor, vkeyboard, router, geometry, spin, spinner, pageselector, mousewheel,language,bibinfo) {
        $(function() {

            try
            {
                console.log
            } catch(err)
            {
                console.log = function() {}
            };

            $.get('templates.html',function(html) {
                $templates = $(html);
                $(document).ready(function() {

                    vkeyboard.view.render();
                    Backbone.history.start();

                    // keep element sizes ok, when window size changes
                    $(window).resize(geometry.resizeHandler);

                    $(window).resize();
                });
            });
        });
});
