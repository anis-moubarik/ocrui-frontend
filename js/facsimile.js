define(['events','backbone'],function (events) {

    EmptyView = Backbone.View.extend({
        el: '#editor',
        render: function() {
            this.$el.html("<div>empty</div>");
        }
    });

    Thumbnails = Backbone.View.extend({
        el: '#facsimile',
        render: function() {
            var $canvas = $('<canvas id="facsimile-canvas">HTML canvas required.</canvas>')
            $canvas.attr(this.horizontalPixels,'width');
            $canvas.attr(this.verticalPixels,'height');
            this.$el.html('');
            this.$el.append($canvas);
        }
    });

    View = Backbone.View.extend({

        initialize: function() {
            var that = this;
            events.on('changeCoordinates',function(data) {
                //BUG
                that.setHighlight(data);
                if (that.image != undefined) {
                    that.render();
                }

            });
        },
        el: '#facsimile-canvas',
        events: {
            'click': 'propagateClick',
            'set-scaling': 'render',
        },

        propagateClick: function(ev) {
            var offset = this.$el.offset()
            var canvasCoords = {
                x:ev.pageX - offset.left,
                y:ev.pageY - offset.top
            };
            var imageCoords = this.canvasCoordsToImageCoords(canvasCoords);
            events.trigger('cursorToCoordinate',imageCoords);
        },
        canvasCoordsToImageCoords: function(coords) {
            return {
                x: coords.x / this.imageHRatio, 
                y: coords.y / this.imageVRatio, 
            }
        },
        imageCoordsToCanvasCoords: function(coords) {
            return {
                x: coords.x * this.imageHRatio, 
                y: coords.y * this.imageVRatio, 
            }
        },
        imageRectangleToCanvasRectangle: function(rect) {

            return {
                hpos : Math.round(rect.hpos * this.imageHRatio),
                vpos : Math.round(rect.vpos * this.imageVRatio),
                width : Math.round(rect.width * this.imageHRatio),
                height : Math.round(rect.height * this.imageVRatio),
            }
        },
        setImage: function(image) {
            this.image = image;
        },
        setHighlight: function(highlight) {
            // highlight is stored in image coordinates
            this.highlight = highlight;
        },
        renderHighlight : function(ctx,hl) {
            if (!hl) { return; }

            //Draw semi transparent highlight box.

            var rect = this.imageRectangleToCanvasRectangle(hl);
            rect.hpos = rect.hpos - 2;
            rect.vpos = rect.vpos - 2;
            rect.width = rect.width + 4;
            rect.height = rect.height + 4;

            // Start with what is already there.
            try {
                var imgd = ctx.getImageData(rect.hpos,rect.vpos,rect.width,rect.height);
            } catch (err) {
                console.log(rect);
                console.log(err);
                return;
            }
            var pix = imgd.data;

            // Loop over each pixel and set rgba
            for (var i = 0; n = pix.length, i < n; i += 4) {
                var ix = Math.floor(i / 4) % rect.width;
                var iy = Math.floor(i / 4 / rect.width);
                if ( (ix == 0) || (ix == rect.width-1) ||
                        (iy == 0) || (iy == rect.height-1)) {
                    pix[i  ] = (pix[i  ] + 144) / 2; // red
                    pix[i+1] = (pix[i+1] + 133) / 2; // green
                    pix[i+2] = (pix[i+2] +  22) / 2; // blue
                } else {
                    pix[i  ] = (pix[i  ] + 244) / 2; // red
                    pix[i+1] = (pix[i+1] + 233) / 2; // green
                    pix[i+2] = (pix[i+2] +  55) / 2; // blue
                }
            }

            ctx.putImageData(imgd,rect.hpos,rect.vpos);
        },
        render: function() {

            // default to 500x500 in case of trouble
            this.horizontalPixels = this.$el.attr('width') || 500;
            this.verticalPixels = this.$el.attr('width') || 500;
            this.imageHRatio = this.horizontalPixels;
            this.imageVRatio = this.verticalPixels;


            var ctx = this.$el.get(0).getContext("2d");
    
            if (this.image) {
                try {
                    ctx.drawImage(this.image.image,0,0,
                            this.horizontalPixels,this.verticalPixels);
                } catch (err) {
                    console.log(err);
                }
            }


            this.renderHighlight(ctx,this.highlight);

            // Call the geometry handler:
            // TODO: get rid of this. handle geometry otherwise
        }
    });


    return {
        view: new View(),
        thumbnails: new Thumbnails(),
        empty: new EmptyView(),
    }

});
