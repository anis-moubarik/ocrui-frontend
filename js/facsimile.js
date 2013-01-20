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
                var x = this.horizontalPixels / 2;
                var y = this.verticalPixels / 2;
                that.adjustZoom(2,x,y);
            });

            events.on('button-zoom-out-clicked',function(data) {
                var x = this.horizontalPixels / 2;
                var y = this.verticalPixels / 2;
                that.adjustZoom(0.5,x,y);
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
            'mousewheel': 'wheel',
            'mousemove': 'pan',
            'mousedown': 'beginPan',
            'mouseup': 'endPan',
            'mouseout': 'cancelPan',
            'set-scaling': 'render',
        },
        adjustZoom: function(amount,fixedX,fixedY) {
            var scale = this.pageScale * amount;
            if (scale < 0.01) scale = 0.01;
            if (scale > 1) scale = 1;

            var oldOriginDistanceX = (fixedX - this.originX) * this.pageScale;
            var oldOriginDistanceY = (fixedY - this.originX) * this.pageScale;
            var originDistanceX = (fixedX - this.originX) * scale;
            var originDistanceY = (fixedY - this.originX) * scale;
            var originDeltaX = oldOriginDistanceX - originDistanceX;
            var originDeltaY = oldOriginDistanceY - originDistanceY;
            var scaleChange = (scale / this.pageScale);
            console.log('z',oldOriginDistanceX, oldOriginDistanceY,originDistanceX, originDistanceY, originDeltaX,originDeltaY);
            this.setOrigin(
                    this.originX + originDeltaX,
                    this.originY + originDeltaY);
            var fixedPageX = this.origin
            this.pageScale = scale
            this.render();
        },
        wheel: function(ev,delta,deltaX,deltaY) {
            var offset = this.$el.offset();
            var x = ev.pageX - offset.left;
            var y = ev.pageY - offset.top;
            if (delta > 0) {
                this.adjustZoom(1.5,x,y);
            } else {
                this.adjustZoom(0.75,x,y);
            }
        },

        beginPan: function(ev) {
            this.propageteNextClick = true;
            this.panning = true;
            this.savedOriginX = this.originX;
            this.savedOriginY = this.originY;

            var offset = this.$el.offset();
            this.panBeginX = ev.pageX - offset.left;
            this.panBeginY = ev.pageY - offset.top;
            ev.preventDefault();
            ev.stopPropagation();
        },
        endPan: function(ev) {
            this.panning = false;
        },
        cancelPan: function(ev) {

            if (!this.panning) return;
            this.setOrigin(this.savedOriginX, this.savedOriginY);
            this.render();
            this.panning = false;

        },
        pan: function(ev) {
            this.propageteNextClick = false;
            if (!this.panning) {
                return
            }
            var offset = this.$el.offset();
            var currentX = ev.pageX - offset.left;
            var currentY = ev.pageY - offset.top;

            this.setOrigin(
                this.savedOriginX - (this.panBeginX - currentX),
                this.savedOriginY - (this.panBeginY - currentY));
            this.render();

        },
        propagateClick: function(ev) {
            if (!this.propageteNextClick) return;
            var offset = this.$el.offset()
            var canvasCoords = {
                x:ev.pageX - offset.left,
                y:ev.pageY - offset.top
            };
            // BUG: scaling?
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

            this.horizontalPixels = this.$el.attr('width') || this.pageHRatio;
            this.verticalPixels = this.$el.attr('height') || this.pageVRatio;

            var ctx = this.$el.get(0).getContext("2d");

            ctx.setTransform(1,0,0,1,0,0);
            ctx.clearRect( 0, 0, this.horizontalPixels, this.verticalPixels);
    
            if (this.image) {
                this.pageHRatio = this.image.height;
                this.pageVRatio = this.image.width;
                //ctx.scale(this.pageScale,this.pageScale);
                console.log(
                        this.pageScale,
                        0,
                        0,
                        this.pageScale,
                        this.originX,
                        this.originY );
                ctx.setTransform(
                        this.pageScale,
                        0,
                        0,
                        this.pageScale,
                        this.originX,
                        this.originY );
                var iWidth = this.image.width;
                var iHeight = this.image.height;
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 20;
                try {
                    ctx.drawImage(this.image.image,0,0);
                } catch (err) {
                    console.log(err);
                }
                ctx.shadowBlur = 0;
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
