/*globals console:true setTimeout:false */
define(['jquery','toolbar','events','backbone','mousetailstack'],function ($,toolbar,events,Backbone,mousetailstack) {
    "use strict";

    // This is used to implement nice non-sticky panning
    function MouseTailStack(callback,timeTolerance) {

        if (timeTolerance === undefined) {

            timeTolerance = 100; // milliseconds

        }

        this.stack = [];
        this.length = 0.6; // 0 <= length < 1
        this.callback = callback;
        this.init = init;
        this.push = push;
        this.removeStaleElements = removeStaleElements;
        this.end = end;
        this.triggerTail = triggerTail;
        this.timeTolerance = timeTolerance

    }

    function init(ev) {

        this.stack = [ev];
        this.dx = 0;
        this.dy = 0;

    }

    function push (ev) {

        this.stack.push(ev);
        this.removeStaleElements(ev);

    }

    function removeStaleElements (ev) {

        // This assumes events are pushed in timestamp order
        // This might not be strictly valid assumption but don't worry
        // about it, this is good enough
        var i = 0;

        while ((i < this.stack.length) &&
                (ev.timeStamp - this.stack[i].timeStamp > this.timeTolerance)) {

            i += 1;

        }

        this.stack.splice(0,i);

    }

    function truncate(n) {

        return Math[n > 0 ? "floor" : "ceil"](n);

    }

    function triggerTail() {

        var that = this;

        this.dx = truncate(this.dx*this.length);
        this.dy = truncate(this.dy*this.length);

        if ((this.dx != 0) && (this.dy != 0)) {

            setTimeout( function() { that.triggerTail(); }, 50);
            events.trigger('mousetail',[this.dx,this.dy]);

        }


    }

    function end (ev) {
        
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

        this.triggerTail();

    }

    return {
        MouseTailStack: MouseTailStack
    }

});
