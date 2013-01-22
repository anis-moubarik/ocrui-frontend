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
            cb(data);
        }

    }

    return {
        on:on,
        trigger:trigger
    };

});
