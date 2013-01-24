/*globals console:true */
define(function () {
    "use strict";

    var listeners = {};

    function on (ev,cb) {

        if (!(ev in listeners)) {
            listeners[ev] = [];
        }

        listeners[ev].push(cb);

    }

    function trigger (ev,data) {

        if (!(ev in listeners)) {
            listeners[ev] = [];
        }

        for (var i in listeners[ev]) {
            var cb = listeners[ev][i];
            try {
                cb(data);
            } catch (err) {
                console.log(err);
                console.trace();
            }
        }

    }

    return {
        on:on,
        trigger:trigger
    };

});
