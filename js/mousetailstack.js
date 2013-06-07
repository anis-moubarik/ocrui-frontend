define(['jquery','events'],function ($,events) {
    "use strict";

    // This is used to implement nice non-sticky panning
    function MouseTailStack(callback,timeTolerance) {

        if (timeTolerance === undefined) {

            timeTolerance = 100; // milliseconds

        }

        this.stack = [];
        this.length = 0.6; // 0 <= length < 1
        this.callback = callback;
        this.timeTolerance = timeTolerance;
        
        var that = this;

        events.on('mousetail', function() { that.triggerTail(); });

    }

    MouseTailStack.prototype.init = function (ev) {

        this.stack = [ev];
        this.dx = 0;
        this.dy = 0;

    };

    MouseTailStack.prototype.push = function  (ev) {

        this.stack.push(ev);
        this.removeStaleElements(ev);

    };

    MouseTailStack.prototype.removeStaleElements = function  (ev) {

        // This assumes events are pushed in timestamp order
        // This might not be strictly valid assumption but don't worry
        // about it, this is good enough
        var i = 0;

        if (ev.timeStamp === 0) {
            // firefox timeStamps are bad, kludge over it.
            this.stack = [];
        }

        while ((i < this.stack.length) &&
                (ev.timeStamp - this.stack[i].timeStamp > this.timeTolerance)) {

            i += 1;

        }

        this.stack.splice(0,i);

    };

    MouseTailStack.prototype.triggerTail = function () {


        /* If there is lag, just don't bother with tail */
        if (Date.now() > this.lagToleration) {
            return;
        }
        this.lagToleration += 50;

        this.dx = truncate(this.dx*this.length);
        this.dy = truncate(this.dy*this.length);

        if ((this.dx !== 0) && (this.dy !== 0)) {

            events.delay('mousetail',[this.dx,this.dy],50);

        }

    };

    MouseTailStack.prototype.end = function  (ev) {
        
        this.removeStaleElements(ev);

        // Sometimes (mouseout) there is no proper coordinates
        // on events. Just give up if that happens

        try {

            var ev0 = this.stack[0];
            this.dx = ev.pageX - ev0.pageX;
            this.dy = ev.pageY - ev0.pageY;

        } catch (err) {

            return;

        }

        this.lagToleration = Date.now() + 300;
        this.triggerTail();

    };

    function truncate (n) {

        return Math[n > 0 ? "floor" : "ceil"](n);

    }

    return {
        MouseTailStack: MouseTailStack
    };

});
