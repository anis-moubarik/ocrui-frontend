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
        'save',
        'container',
        'boxes',
        'dialog',
        'events'
    ], function($, bootstrap,mustache, underscore, jqueryui, backbone, codemirror, toolbar, facsimile, editor, vkeyboard, router, geometry, spin, spinner, pageselector, mousewheel,language,bibinfo,save,container,boxes,dialog,events) {
        $(function() {

            try {
                console.log;
            } catch (err) {
                console = {
                    log: function() {},
                    trace: function() {}
                };
            }

            // This is used to make tests able to access modules
            window.testing = {
                $ : $,
                bootstrap : bootstrap,
                mustache : mustache,
                underscore : underscore,
                jqueryui : jqueryui,
                backbone : backbone,
                codemirror : codemirror,
                toolbar : toolbar,
                facsimile : facsimile,
                editor : editor,
                vkeyboard : vkeyboard,
                router : router,
                geometry : geometry,
                spin : spin,
                spinner : spinner,
                pageselector : pageselector,
                mousewheel : mousewheel,
                language : language,
                bibinfo : bibinfo,
                save : save,
                container : container,
                boxes : boxes,
                dialog : dialog,
                events : events
            }

            $.get('templates.html',function(html) {
                $templates = $(html);
                $(document).ready(function() {

                    vkeyboard.view.render();
                    Backbone.history.start();

                    // keep element sizes ok, when window size changes
                    $(window).resize(geometry.resizeHandler);

                    $(window).resize();

                    events.trigger('appReady');
                });
            });
        });
});
