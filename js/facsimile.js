/*globals console:true setTimeout:false setInterval:false */
define(['jquery','events','backbone','image','container'],
        function ($,events,Backbone,image,container) {
    "use strict";

    var View = Backbone.View.extend({

        initialize: function() {

            var that = this;

            events.on('changePage',function(data) {
                that.changePage(data);
            });


            events.on('scheduledRender', function() {
                that.render();
            });

        },
        el: '#facsimile-canvas',
        events: {
        },

        changePage: function(attributes) {

            var that = this;
            this.attributes = attributes;
            image.get(attributes).done( function (image) {

                /* if (that.attributes != attributes) return; */
                that.image = image;
                container.view.setImageSize(image.width,image.height);
                that.render();
                events.trigger('changePageImage',image); 

            }).fail(function(msg) {
                events.trigger('changePageImageError',msg);
            });

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
            events.trigger('facsimileRendered',this.attributes);

        }
    });

    return {
        view: new View(),
    };

});
