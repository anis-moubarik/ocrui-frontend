/*globals window:false */
define(['jquery','events'], function($,events) {
    "use strict";

    var currentGeometry = {};

    function resizeHandler () {
        var topHeight = $('#toolbar').outerHeight();
        var bottomHeight = $('#bottom-geometry').outerHeight();
        var wHeight = $(window).innerHeight();
        var availableH = wHeight - topHeight - bottomHeight;
        availableH -= 30; // TODO: what is 30!
        var facsimileWidth = $('#facsimile-container').innerWidth();
        var facsimileHeight = availableH;
        var data = {
            facsimileWidth: facsimileWidth,
            facsimileHeight: facsimileHeight
        };

        if (
            (data.facsimileWidth != currentGeometry.facsimileWidth) ||
            (data.facsimileHeight != currentGeometry.facsimileHeight)
            ) {
            $('#editor').height(availableH);
            $('.CodeMirror').height(availableH);
            $('#facsimile-container').height(availableH);
            $('#spinner').height(availableH);
            currentGeometry = data;
            events.trigger('setGeometry',data);
        }
    }

    // keep element sizes ok, when window size changes
    $(window).resize(resizeHandler);

    events.on('changePageDone',resizeHandler);
    events.on('changePageError',resizeHandler);
    events.on('keyboardLayoutChanged',resizeHandler);

    return {
        resizeHandler: resizeHandler
    };
});
