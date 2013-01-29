/*globals console:true setTimeout:false setInterval:false */
define(['jquery','events','backbone','container'],
        function ($,events,Backbone,container) {
    "use strict";

    var View = Backbone.View.extend({

        initialize: function() {

            var that = this;

            events.on('changePageImage',function(image) {
                that.setImage(image);
            });

            events.on('scheduledRender', function() {
                that.render();
            });

        },
        el: '#facsimile-canvas',
        events: {
        },

        setImage: function(image) {
            this.image = image;
            this.imageWidth = this.image.width;
            this.imageHeight = this.image.height;
            this.render();
        },
        render: function() {

            var ctx = this.$el.get(0).getContext("2d");
            var w = container.view.getWidth();
            var h = container.view.getHeight();
            var zoom = container.view.getZoom();
            var originX = container.view.getOriginX();
            var originY = container.view.getOriginY();

            if (!this.image) { return; }

            ctx.setTransform(1,0,0,1,0,0);
            ctx.clearRect( 0, 0, w, h);
    
            ctx.setTransform( zoom, 0, 0, zoom, originX, originY );

            ctx.shadowColor = 'black';
            ctx.shadowBlur = 20;

            try {

                ctx.drawImage(this.image.image,0,0);

            } catch (err) {

                console.log(err);

            }

        }
    });

    return {
        view: new View(),
    };

});
