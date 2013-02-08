define(['jquery','underscore','jsdiff','utils'],function ($,_,jsdiff,utils) {
    "use strict";

    // IE8...

    if (!Date.now) {
        Date.now = function() {
            return new Date().valueOf();
        }
    }

    return;
});
