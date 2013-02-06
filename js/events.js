define(function () {
    "use strict";

    /* Implementation of an unreliable event bus
     * When event is triggered, the data passed may or may not ever
     * be received by listeners. Subsequent triggerings of the same event
     * overwrite the passed data.
     *
     * If reliable data passing is necessary, use triggerImmediately,
     * but it's worse.
     */

    var listeners = {};
    var anyListeners = [];
    var schedule = {};

    // debug:
     onAny(function(ev,data) {console.log(ev,data);});

    // listen to all sent events, for testing and debugging
    function onAny (cb) {
        anyListeners.push(cb);
    }

    function on (ev,cb) {

        if (!(ev in listeners)) {
            listeners[ev] = [];
        }

        listeners[ev].push(cb);

    }


    function triggerImmediately (ev, data) {

        if (!(ev in listeners)) {
            listeners[ev] = [];
        }

        for (var i in listeners[ev]) {
            var cb = listeners[ev][i];
            cb(data);
        }

        for (var i in anyListeners) {
            var cb = anyListeners[i];
            cb(ev,data);
        }

    }

    /* schedules an event to be triggered as soon as possible.
     */
    function trigger (ev,data) {

        delay(ev,data,0);

    }

    /* Delayed triggering of an event. Waits a moment before triggering
     * and only triggers once if there is many triggering requests done
     * in short time period.
     */
    function delay (ev,data,timeout) {

        if (timeout === undefined) {
            timeout = 100;
        }

        clearScheduledCallbacks(ev);

        schedule[ev] = setTimeout(function() {
            triggerImmediately(ev,data);
        }, timeout);

    }

    function clearScheduledCallbacks(ev) {

        if (schedule[ev] !== undefined) {
            clearTimeout(schedule[ev]);
            schedule[ev] = undefined;
        }

    }

    return {
        on:on,
        onAny:onAny,
        anyListeners:anyListeners,
        triggerImmediately:triggerImmediately,
        trigger:trigger,
        delay:delay
    };

});


