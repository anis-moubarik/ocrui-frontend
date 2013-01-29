/*globals console:true setTimeout:false setInterval:false */
define(['underscore','jquery','toolbar','events','backbone','mousetailstack'],
        function (_,$,toolbar,events,Backbone,mousetailstack) {
    "use strict";

    var View = Backbone.View.extend({

        initialize: function() {

            var that = this;

            events.on('changePageImage',function(image) {
                that.setImage(image);
                that.scheduleRender();
            });

            events.on('setGeometry', function() {
                that.scheduleRender ();
            });
            setInterval(function() {that.processRenderingRequests();},40);
        },
        el: '#facsimile-canvas',
        events: {
            'click': 'propagateClick',
            'mousewheel': 'wheel',
            'mousemove': 'pan',
            'mousedown': 'beginPan',
            'mouseup': 'endPan',
            'mouseout': 'endPan',
        },

        setImage: function(image) {
            this.image = image;
        },
            this.scrollingTo = {x:scrollToX,y:scrollToY};

        },
        scheduleRender: function () {
            this.requestRendering = true;
        },
        processRenderingRequests: function() {
            if (this.requestRendering === false) return;
            this.requestRendering = false;
            this.render();
        },
        render: function() {

            this.setPixels(
                this.$el.attr('width') || this.imageWidth,
                this.$el.attr('height') || this.imageHeight);

            var ctx = this.$el.get(0).getContext("2d");

            ctx.setTransform(1,0,0,1,0,0);
            ctx.clearRect( 0, 0, this.horizontalPixels, this.verticalPixels);
    
            if (!this.image) { return; }

            this.imageWidth = this.image.width;
            this.imageHeight = this.image.height;
            ctx.setTransform(
                    this.pageScale,
                    0,
                    0,
                    this.pageScale,
                    this.originX,
                    this.originY );
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 20;
            try {
                ctx.drawImage(this.image.image,0,0);
            } catch (err) {
                console.log(err);
            }
            ctx.shadowBlur = 0;

        }
    });

    return {
        view: new View(),
    };

});
