require.config({
    'urlArgs': "bust="+Date.now(), // fix caching troubles
    'paths': {
        "bootstrap": "../lib/bootstrap/js/bootstrap",
        "codemirror": "../CodeMirror/lib/codemirror",
        "jquery": "../lib/jquery",
        "base64": "../lib/base64",
        "mustache": "../lib/mustache",
        "underscore": "../lib/underscore-min",
        "jquery-ui": "../lib/jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.min",
        "jquery-appear": "../lib/jquery-appear",
        "backbone": "../lib/backbone",
        "jsdiff": "../lib/jsdiff",
        "spin": "../lib/spin",
        "mousewheel": "../lib/jquery-mousewheel",
        "text": "../lib/text",
        "qtip": "../lib/jquery.qtip.custom/jquery.qtip"

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

$.fn.selectRange = function(start, end) {
    return this.each(function() {
        if(this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if(this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};

$.fn.getCursorPosEnd = function() {
    var pos = 0;
    var input = this.get(0);
    // IE Support
    if (document.selection) {
        input.focus();
        var sel = document.selection.createRange();
        pos = sel.text.length;
    }
    // Firefox support
    else if (input.selectionStart || input.selectionStart == '0')
        pos = input.selectionEnd;
    return pos;
};

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
        'qtip'
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
