define([], function() {

    function resizeHandler (ev) {
        var topHeight = $('#toolbar').outerHeight();
        var bottomHeight = $('#vkeyboard').outerHeight();
        var wHeight = $(window).innerHeight();
        var availableH = wHeight - topHeight - bottomHeight;
        $('#editor').height(availableH);
        $('.CodeMirror').height(availableH-10); // TODO: what is -10
        $('#facsimile').height(availableH);
        var facsimileWidth = $('#facsimile').innerWidth();
        var canvasSize = _.max([facsimileWidth,availableH]);
        $('#facsimile-canvas').height(canvasSize);
        $('#facsimile-canvas').width(canvasSize);
    };

    return {
        resizeHandler: resizeHandler
    };
});
