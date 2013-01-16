define(['spinner','events','backbone'],function (spinner,events) {

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
            $canvas.attr('width',this.horizontalPixels);
            $canvas.attr('height',this.verticalPixels);
            this.$el.html('');
            this.$el.append($canvas);
        }
    });

    View = Backbone.View.extend({

        initialize: function() {
            var that = this;
            this.spinner = spinner.createSpinner();
            events.on('changeCoordinates',function(data) {
                //BUG
                that.setHighlight(data);
                that.render();

            });
        },
        el: '#facsimile',
        events: {
            'click #facsimile-canvas': 'propagateClick',
            'resize #facsimile-canvas': 'setWindowScaling',
        },

        horizontalPixels : 500,
        verticalPixels : 500,
        propagateClick: function(ev) {
            var canvasCoords = this.onWindowCoordsToCanvasCoords({
                x:ev.pageX,
                y:ev.pageY
            });
            var imageCoords = this.canvasCoordsToImageCoords(canvasCoords);
            console.log(JSON.stringify(canvasCoords));
            console.log(JSON.stringify(imageCoords));
            events.trigger('cursorToCoordinate',imageCoords);
        },
        onWindowCoordsToCanvasCoords: function(coords) {
            var offset = $('#facsimile-canvas').offset();
            return {
                x: (coords.x - offset.left) / this.windowHRatio,
                y: (coords.y - offset.top) / this.windowVRatio,
            }
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
            this.imageHRatio = this.horizontalPixels / this.image.width;
            this.imageVRatio = this.verticalPixels / this.image.height;
        },
        setHighlight: function(highlight) {
            // highlight is stored in image coordinates
            this.highlight = highlight;
        },
        showSpinner : function() {
            // TODO: dim canvas
            this.spinner.spin(this.$el.get(0));
        },
        setWindowScaling : function() {
            onScreenWidth = this.$el.innerWidth();
            onScreenHeight = this.$el.innerHeight();
            this.windowHRatio = onScreenWidth / this.horizontalPixels;
            this.windowVRatio = onScreenHeight / this.verticalPixels;
        },
        renderHighlight : function(ctx,hl) {
            if (!hl) { return; }

            //Draw semi transparent highlight box. won't work. BUG?

            var rect = this.imageRectangleToCanvasRectangle(hl);

            // Start with what is already there.
            var imgd = ctx.getImageData(rect.hpos,rect.vpos,rect.width,rect.height);
            console.log(JSON.stringify(hl))
            console.log(JSON.stringify(rect))
            var pix = imgd.data;

            // Loop over each pixel and set rgba
            for (var i = 0; n = pix.length, i < n; i += 4) {
                var ix = Math.floor(i / 4) % rect.width;
                var iy = Math.floor(i / 4 / rect.width);
                if ( (ix == 0) || (ix == rect.width-1) ||
                        (iy == 0) || (iy == rect.height-1)) {
                    pix[i  ] = (pix[i  ] + 144) / 2; // red
                    pix[i+1] = (pix[i+1] + 133) / 2; // green
                    pix[i+2] = (pix[i+2] +  88) / 2; // blue
                } else {
                    pix[i  ] = (pix[i  ] + 244) / 2; // red
                    pix[i+1] = (pix[i+1] + 233) / 2; // green
                    pix[i+2] = (pix[i+2] + 111) / 2; // blue
                }
            }

            ctx.putImageData(imgd,rect.hpos,rect.vpos);
        },
        render: function(extradebug) {
            this.spinner.stop();
            var $canvas = $('<canvas id="facsimile-canvas">HTML canvas required.</canvas>')
            $canvas.attr('width',this.horizontalPixels);
            $canvas.attr('height',this.verticalPixels);
            this.$el.html('');
            this.$el.append($canvas);

            var canvas = $canvas.get(0);
            var ctx = canvas.getContext("2d");
            try {
                ctx.drawImage(this.image.image,0,0,
                        this.horizontalPixels,this.verticalPixels);
            } catch (err) {
                console.log(err);
            }

            $canvas.resize(); // trigger to get initial scaling

            this.renderHighlight(ctx,this.highlight);
            for (var i in extradebug) {
                this.renderHighlight(ctx,extradebug[i]);
            }


            // Call the geometry handler:
            // TODO: get rid of this. handle geometry otherwise
            $(window).resize();
        }
    });


    return {
        view: new View(),
        thumbnails: new Thumbnails(),
        empty: new EmptyView(),
    }

});
