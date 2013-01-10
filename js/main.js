require.config({
    'paths': {
        'bootstrap': '../bootstrap/js/bootstrap',
        'codemirror': '../codemirror/lib/codemirror',
    } });

require(
    [
        "jquery",
        "mustache.min",
        "underscore-min",
        "jquery-ui.min",
        "backbone-min",
        "codemirror",
        "ocrui",
        "toolbar",
        "facsimile",
        "editor",
        "vkeyboard",
        "router",
    ], function($) {
        $(function() {
            $("#toolbar").toolbar();
            $("#vkeyboard").vkeyboard();
            Backbone.history.start();
        });
});
