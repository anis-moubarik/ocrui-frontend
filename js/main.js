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
    ], function($, mustache, underscore, jqueryui, backbone, codemirror, ocrui, toolbar, facsimile, editor, vkeyboard, router) {
        $(function() {
            $.get('templates.html',function(html) {
                $templates = $(html);
                $(document).ready(function() {

                    toolbar.view.render();
                    vkeyboard.view.render();
                    Backbone.history.start();

                    // keep element sizes ok, when window size changes
                    $(window).resize(function (ev) {
                        var topHeight = $('#toolbar').outerHeight();
                        var bottomHeight = $('#vkeyboard').outerHeight();
                        var wHeight = $(window).innerHeight();
                        var availableH = wHeight - topHeight - bottomHeight;
                        $('#editor').height(availableH);
                        $('#facsimile').height(availableH);
                        var facsimileWidth = $('#facsimile').innerWidth();
                        var canvasSize = _.max([facsimileWidth,availableH]);
                        $('#facsimile-canvas').height(canvasSize);
                        $('#facsimile-canvas').width(canvasSize);

                    });
                    $(window).resize();

                });
            });
        });
});
