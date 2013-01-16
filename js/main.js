var $templates = undefined;

require.config({
    'paths': {
        "bootstrap": "../lib/bootstrap/js/bootstrap",
        "codemirror": "../lib/codemirror-3.0/lib/codemirror",
        "jquery": "../lib/jquery",
        "mustache": "../lib/mustache",
        "underscore": "../lib/underscore-min",
        "jquery-ui": "../lib/jquery-ui.min",
        "backbone": "../lib/backbone-min",
        "jsdiff": "../lib/jsdiff",
        "spin": "../lib/spin",
    },
    'shim': {
        'backbone': {deps:['jquery','underscore']},
    },
    });

require(
    [
        "jquery",
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
    ], function($, mustache, underscore, jqueryui, backbone, codemirror, ocrui, toolbar, facsimile, editor, vkeyboard, router, geometry, spin, spinner, pageselector) {
        $(function() {
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
