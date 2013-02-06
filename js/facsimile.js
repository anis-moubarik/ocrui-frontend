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

        getAttributes: function(attributes, pageDelta) {
            var a = {
                docId : attributes.docId,
                pageNumber : attributes.pageNumber + pageDelta
            }
            return a;
        },
        changePage: function(attributes) {

            var that = this;
            this.attributes = attributes;
            this.nextAttributes = this.getAttributes(attributes,1);
            this.prevAttributes = this.getAttributes(attributes,-1);
            image.get(attributes).done( function (img) {

                /* if (that.attributes != attributes) return; */
                that.image = img;
                /*
                that.prevImage = undefined;
                that.nextImage = undefined;
                */
                events.trigger('changePageImage',img); 
                that.render();

                console.log('rendered',JSON.stringify(attributes));
                console.log('caching',JSON.stringify(that.nextAttributes));
                image.get(that.nextAttributes).done( function (img) {
                    /* if (that.attributes != attributes) return; */
                    that.nextImage = img;
                    console.log('set next img ',JSON.stringify(that.nextAttributes));

                    /*
                    container.view.setNextImageSize(img.width,img.height);
                    that.render();
                    */
                });
                console.log('caching',JSON.stringify(that.prevAttributes));
                image.get(that.prevAttributes).done( function (img) {
                    /* if (that.attributes != attributes) return; */
                    that.prevImage = img;
                    console.log('set prev img ',JSON.stringify(that.prevAttributes));
                    /*
                    container.view.setPrevImageSize(img.width,img.height);
                    that.render();
                    */
                });

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

            ctx.drawImage(this.image.image,0,0);
            /*
            if (this.nextImage) {
                ctx.drawImage(this.nextImage.image,0,this.image.height*1.1);
            }
            if (this.prevImage) {
                ctx.drawImage(this.prevImage.image,0,-this.prevImage.height*1.1);
            }
            */
            events.trigger('facsimileRendered',this.attributes);

        }
    });

    return {
        view: new View(),
    };

});
