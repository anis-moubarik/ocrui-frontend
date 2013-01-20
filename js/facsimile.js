define(['toolbar','events','backbone'],function (toolbar,events) {

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
            this.pageScale = 1; // 
            this.originX = 0; //
            this.originY = 0; //
            this.pageHRatio = 500; // initial something
            this.pageVRatio = 500; // initial something

            toolbar.registerButton('zoom-in','click','icon-zoom-in',['page']);
            toolbar.registerButton('zoom-out','click','icon-zoom-out',['page']);

            events.on('button-zoom-in-clicked',function(data) {
                var scale = that.pageScale * 2;
                if (scale > 1) scale = 1;
                that.pageScale = scale;
                console.log(that.pageScale);
                that.render();
            });

            events.on('button-zoom-out-clicked',function(data) {
                var scale = that.pageScale / 2;
                if (scale < 0.01) scale = 0.01;
                that.pageScale = scale;
                console.log(that.pageScale);
                that.render();
            });

            events.on('changeCoordinates',function(data) {
                // gets called whenever cursor moves in editor
                that.setHighlight(data);
                that.render();
            
            });

            events.on('setZoom',function(data) {
                that.setZoom(data);
                that.render();
            });

            events.on('setOrigin',function(data) {
                that.setOrigin(data.x,data.y);
                that.render();
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
            var imageCoords = this.canvasCoordsToPageCoords(canvasCoords);
            events.trigger('cursorToCoordinate',imageCoords);
        },
        canvasCoordsToPageCoords: function(coords) {
            return {
                x: coords.x / this.pageHRatio, 
                y: coords.y / this.pageVRatio, 
            }
        },
        pageCoordsToCanvasCoords: function(coords) {
            return {
                x: coords.x * this.pageHRatio, 
                y: coords.y * this.pageVRatio, 
            }
        },
        pageRectangleToCanvasRectangle: function(rect) {

            return {
                hpos : Math.round(rect.hpos * this.pageHRatio),
                vpos : Math.round(rect.vpos * this.pageVRatio),
                width : Math.round(rect.width * this.pageHRatio),
                height : Math.round(rect.height * this.pageVRatio),
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

            var rect = this.pageRectangleToCanvasRectangle(hl);
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
        setZoom: function (scale) {
            this.pageScale = scale;
        },
        setOrigin: function (originX,originY) {
            this.originX = originX; // logical coordinate origin for panning
            this.originY = originY; // logical coordinate origin for panning
        },
        render: function() {

            // default to 500x500 in case of trouble
            this.horizontalPixels = this.$el.attr('width') || this.pageHRatio;
            this.verticalPixels = this.$el.attr('height') || this.pageVRatio;

            var ctx = this.$el.get(0).getContext("2d");

            ctx.clearRect(
                    0,
                    0,
                    this.horizontalPixels / this.pageScale,
                    this.verticalPixels / this.pageScale);
    
            if (this.image) {
                this.pageHRatio = this.image.height;
                this.pageVRatio = this.image.width;
                //ctx.scale(this.pageScale,this.pageScale);
                ctx.setTransform(this.pageScale,0,0,this.pageScale,0,0);
                cc=ctx;
                try {
                    var iWidth = this.image.width;
                    var iHeight = this.image.height;
                    ctx.drawImage(this.image.image,0,0);
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
