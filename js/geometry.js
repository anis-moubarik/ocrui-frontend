/*globals window:false */
define(['jquery','events'], function($,events) {
    "use strict";

    var vertical = false;
    var currentGeometry = {};

    function changeLayout(vert) {
        var $els = $('#facsimile-container,#editor');

        if (vert) {

            vertical = true;
            $els.removeClass('vertical');
            $els.removeClass('span6');
            $els.addClass('horizontal');
            $els.addClass('span12');

        } else {

            vertical = false;
            $els.addClass('vertical');
            $els.addClass('span6');
            $els.removeClass('horizontal');
            $els.removeClass('span12');

        }
        resizeHandler ();
    }

    function newViewportRequest(data) {
        changeLayout(data.vertical);
    }

    function resizeHandler () {
        var topHeight = $('#toolbar').outerHeight();
        var bottomHeight = $('#bottom-geometry').outerHeight();
        var wHeight = $(window).innerHeight();
        var availableH = wHeight - topHeight - bottomHeight;
        if (vertical) {
            availableH /= 2;
        } else {

        }

        availableH -= 30; // TODO: what is 30!

        var facsimileWidth = $('#facsimile-container').innerWidth();
        var facsimileHeight = availableH;
        var data = {
            width: facsimileWidth,
            height: facsimileHeight,
            vertical: vertical
        };

        if (
            (data.vertical != currentGeometry.vertical) ||
            (data.width != currentGeometry.facsimileWidth) ||
            (data.height != currentGeometry.facsimileHeight)
            ) {
            $('#editor').height(availableH);
            $('.CodeMirror').height(availableH);
            $('#facsimile-container').height(availableH);
            $('#document').css('max-height',availableH);
            $('#spinner').height(availableH);
            $('#tagtooltip').height(availableH);
            currentGeometry = data;
            events.trigger('setGeometry',data);
        }
    }

    // keep element sizes ok, when window size changes
    $(window).resize(resizeHandler);

    events.on('changePageDone',resizeHandler);
    events.on('changePageError',resizeHandler);
    events.on('keyboardLayoutChanged',resizeHandler);
    events.on('newViewportRequest',newViewportRequest);
    events.on('changeLayout',changeLayout);

    return {
        resizeHandler: resizeHandler
    };
});
