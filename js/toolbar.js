define(['mustache','backbone'],function (mustache) {

    // handle keyboard shortcuts also

    var keyboardShortcuts = {};

    function registerKeyboardShortcut(which,callback) {
        if (which in keyboardShortcuts) {
            throw "Trying to reregister shortcut for " + which;
        }
        keyboardShortcuts [which] = callback;
    };

    $('body').on('keydown',function(ev) {
        var callback = keyboardShortcuts[ev.which];
        if (callback) {
            callback();
        }
    });

    return {
        registerKeyboardShortcut : registerKeyboardShortcut,
    }

});
