/*globals window:false */
define(['jquery','events'], function($,events) {
    "use strict";

    function resizeHandler () {
        var topHeight = $('#toolbar').outerHeight();
        var bottomHeight = $('#bottom-geometry').outerHeight();
        var wHeight = $(window).innerHeight();
        var availableH = wHeight - topHeight - bottomHeight;
        availableH -= 30; // TODO: what is 30!
        $('#editor').height(availableH);
        $('.CodeMirror').height(availableH);
        $('#facsimile-container').height(availableH);
        $('#spinner').height(availableH);
        var facsimileWidth = $('#facsimile-container').innerWidth();
        var facsimileHeight = $('#facsimile-container').innerHeight();
        $('#facsimile-canvas').attr('height',facsimileHeight);
        $('#facsimile-canvas').attr('width',facsimileWidth);
        var data = {
            facsimileWidth: facsimileWidth,
            facsimileHeight: facsimileHeight
        };

        events.trigger('setGeometry',data);
    }

    // keep element sizes ok, when window size changes
    $(window).resize(resizeHandler);

    events.on('changePageDone',resizeHandler);
    events.on('changePageError',resizeHandler);

    return {
        resizeHandler: resizeHandler
    };
});
