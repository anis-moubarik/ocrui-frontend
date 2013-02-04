define(function () {
    "use strict";

    var listeners = {};
    var anyListeners = [];
    var queues = {};

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

    function triggerOne (cb, timeout) {

            var args = Array().slice.call(arguments,2);
            setTimeout(function(){
                cb.apply(null,args);
            },0);
            //cb(data);
    }

    function trigger (ev,data) {

        if (!(ev in listeners)) {
            listeners[ev] = [];
        }

        queues[ev] = undefined; // remove any delayed triggerings

        for (var i in listeners[ev]) {
            triggerOne(listeners[ev][i],0,data);
        }
        for (var i in anyListeners) {
            triggerOne(anyListeners[i],0,ev,data);
        };

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
        onAny:onAny,
        anyListeners:anyListeners,
        trigger:trigger,
        delay:delay
    };

});


