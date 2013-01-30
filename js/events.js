/*globals console:true */
define(function () {
    "use strict";

    var debug = true;
    var listeners = {};
    var queues = {};

    function on (ev,cb) {

        if (!(ev in listeners)) {
            listeners[ev] = [];
        }

        listeners[ev].push(cb);

    }

    function trigger (ev,data) {

        if (debug) { console.log(ev); }

        if (!(ev in listeners)) {
            listeners[ev] = [];
        }

        queues[ev] = undefined; // remove any delayed triggerings

        for (var i in listeners[ev]) {
            var cb = listeners[ev][i];
                cb(data);
            try {
                //cb(data);
            } catch (err) {
                console.log(err);
                console.log(err.get_stack());
            }
        }

    }

    /* Delayed triggering of an event. Waits a moment before triggering
     * and only triggers once if there is many triggering requests done
     * in short time period. The data of the last trigger is used only.
     */
    function delay (ev,data,timeout) {

        var that = this;
        if (timeout === undefined) {
            timeout = 100;
        }
        if (queues[ev] === undefined) {
            queues[ev] = [];
            setTimeout(function() {
                processQueue(ev,timeout);
            },timeout);
        }
        queues[ev].push(data);

    }

    function processQueue (ev,timeout) {

        // This might happen if event was triggered without delay before
        // the delay got processed
        if (queues[ev] === undefined) { return; }

        // If there is more than one request in queue, just take the
        // last one and start a new timeout
        // Otherwise, trigger event
        if (queues[ev].length > 1) {
            queues[ev] = [queues[ev][queues[ev].length -1]];
            setTimeout(function() {
                processQueue(ev,timeout);
            },timeout);
        } else {
            var data = queues[ev][0];
            queues[ev] = undefined;
            trigger(ev,data);
        }
    }

    return {
        on:on,
        trigger:trigger,
        delay:delay
    };

});


