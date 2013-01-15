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
            $canvas.attr('width',500);
            $canvas.attr('height',500);
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
                that.render();

            });
        },
        el: '#facsimile',
        events: {
            'click #facsimile-canvas': 'propagateClick'
        },
        propagateClick: function(ev) {
            var offset = $('#facsimile-canvas').offset();
            var coords = this.canvasCoordsToImageCoords({
                x:ev.pageX-offset.left,
                y:ev.pageY-offset.top,
            });
            events.trigger('cursorToCoordinate',coords);
        },
        canvasCoordsToImageCoords: function(coords) {
            return {
                x: coords.x / this.hRatio, 
                y: coords.y / this.vRatio, 
            }
        },
        imageCoordsToCanvasCoords: function(coords) {
            return {
                x: coords.x * this.hRatio, 
                y: coords.y * this.vRatio, 
            }
        },
        setImage: function(image) {
            this.image = image;
        },
        setHighlight: function(highlight) {
            this.highlight = highlight;
        },
        render: function() {
            var $canvas = $('<canvas id="facsimile-canvas">HTML canvas required.</canvas>')
            $canvas.attr('width',500);
            $canvas.attr('height',500);
            this.$el.html('');
            this.$el.append($canvas);

            var canvas = $canvas.get(0);
            var ctx = canvas.getContext("2d");
            ctx.drawImage(this.image.image,0,0,500,500);

            this.hRatio = 500 / this.image.width;
            this.vRatio = 500 / this.image.height;
            if (this.highlight) {

                //Draw semi transparent highlight box. won't work. BUG?

                var x = Math.round(this.highlight.hpos * this.hRatio);
                var y = Math.round(this.highlight.vpos * this.vRatio);
                var w = Math.round(this.highlight.width * this.hRatio);
                var h = Math.round(this.highlight.height * this.vRatio);

                // Start with what is already there.
                var imgd = ctx.getImageData(x,y,w,h);
                var pix = imgd.data;

                // Loop over each pixel and set rgba
                for (var i = 0; n = pix.length, i < n; i += 4) {
                    var ix = Math.floor(i / 4) % w;
                    var iy = Math.floor(i / 4 / w);
                    if ((ix == 0) || (ix == w-1) || (iy == 0) || (iy == h-1)) {
                        pix[i  ] = (pix[i  ] + 144) / 2; // red
                        pix[i+1] = (pix[i+1] + 133) / 2; // green
                        pix[i+2] = (pix[i+2] +  88) / 2; // blue
                    } else {
                        pix[i  ] = (pix[i  ] + 244) / 2; // red
                        pix[i+1] = (pix[i+1] + 233) / 2; // green
                        pix[i+2] = (pix[i+2] + 111) / 2; // blue
                    }
                }

                ctx.putImageData(imgd,x,y);

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
