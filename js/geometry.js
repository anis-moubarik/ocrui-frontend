/*globals window:false */
define(['jquery','events'], function($,events) {
    "use strict";

    function resizeHandler (ev) {
        var topHeight = $('#toolbar').outerHeight();
        var bottomHeight = $('#bottom-geometry').outerHeight();
        var wHeight = $(window).innerHeight();
        var availableH = wHeight - topHeight - bottomHeight;
        $('#editor').height(availableH-20);
        $('.CodeMirror').height(availableH-10); //TODO: what is -10?
        $('#facsimile-container').height(availableH-20); //TODO: what is -20?
        $('#spinner').height(availableH);
        var facsimileWidth = $('#facsimile-container').innerWidth();
        var facsimileHeight = $('#facsimile-container').innerHeight();
        $('#facsimile-canvas').attr('height',facsimileHeight);
        $('#facsimile-canvas').attr('width',facsimileWidth);
        events.trigger('set-scaling');
    }

    return {
        resizeHandler: resizeHandler
    };
});
