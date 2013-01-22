/*globals window:false */
define(['jquery'], function($) {
    "use strict";

    function resizeHandler (ev) {
        var topHeight = $('#toolbar').outerHeight();
        var bottomHeight = $('#vkeyboard').outerHeight();
        var wHeight = $(window).innerHeight();
        var availableH = wHeight - topHeight - bottomHeight;
        $('#editor').height(availableH);
        $('.CodeMirror').height(availableH-10); // TODO: what is -10
        $('#facsimile').height(availableH);
        $('#spinner').height(availableH);
        var facsimileWidth = $('#facsimile').innerWidth();
        var facsimileHeight = $('#facsimile').innerHeight();
        $('#facsimile-canvas').attr('height',facsimileHeight);
        $('#facsimile-canvas').attr('width',facsimileWidth);
        $('#facsimile-canvas').trigger('set-scaling');
    }

    return {
        resizeHandler: resizeHandler
    };
});
