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
            this.pageScale = 0.4; // some default...
            this.originX = 0; //
            this.originY = 0; //
            this.pageHRatio = 500; // initial something
            this.pageVRatio = 500; // initial something

            toolbar.registerButton({
                id:'zoom-in',
                toggle:false,
                icon:'icon-zoom-in',
                title:'Zoom in',
                modes:['page']});
            toolbar.registerButton({
                id:'zoom-out',
                toggle:false,
                icon:'icon-zoom-out',
                title:'Zoom out',
                modes:['page']});
            toolbar.registerButton({
                id:'pan-zoom',
                toggle:true,
                icon:'icon-move',
                title:'Mouse wheel pan/zoom',
                modes:['page']});
            toolbar.registerKeyboardShortcut(113, function(ev) {
                $('#pan-zoom').click();
            });

            events.on('button-zoom-in-clicked',function(data) {
                var x = that.horizontalPixels / 2;
                var y = that.verticalPixels / 2;
                that.adjustZoom(2,x,y);
            });

            events.on('button-zoom-out-clicked',function(data) {
                var x = that.horizontalPixels / 2;
                var y = that.verticalPixels / 2;
                that.adjustZoom(0.5,x,y);
            });

            events.on('button-pan-zoom-clicked',function(data) {
                var toggled = !($('#pan-zoom').hasClass("active"));
                that.wheelPan = toggled;
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
            'mouseout': 'endPan',
            'set-scaling': 'render',
        },
        adjustZoom: function(amount,fixedX,fixedY) {
            var scale = this.pageScale * amount;
            if (scale < 0.01) scale = 0.01;
            if (scale > 1) scale = 1;

            var oldPageFixedX = (fixedX - this.originX) / (this.pageHRatio * this.pageScale);
            var oldPageFixedY = (fixedY - this.originY) / (this.pageVRatio * this.pageScale);
            var newPageFixedX = (fixedX - this.originX) / (this.pageHRatio * scale);
            var newPageFixedY = (fixedY - this.originY) / (this.pageVRatio * scale);
            var scaleChange = (scale / this.pageScale);
            var delta = this.pageCoordsToScreenCoords({
                x: oldPageFixedX - newPageFixedX,
                y: oldPageFixedY - newPageFixedY,
            });
            console.log(
                oldPageFixedX,
                oldPageFixedY,
                newPageFixedX,
                newPageFixedY,
                delta.x,
                delta.y,
                scaleChange);
            this.setOrigin(
                    this.originX - delta.x/2,
                    this.originY - delta.y/2);
            var fixedPageX = this.origin
            this.pageScale = scale
            this.render();
        },
        wheel: function(ev,delta,deltaX,deltaY) {
            var offset = this.$el.offset();
            var x = ev.pageX - offset.left;
            var y = ev.pageY - offset.top;
            if (this.wheelPan) {
                this.setOrigin(
                        this.originX + 32*deltaX,
                        this.originY + 32*deltaY
                    );
                this.render();
            } else {
                if (delta > 0) {
                    this.adjustZoom(1.5,x,y);
                } else {
                    this.adjustZoom(0.75,x,y);
                }
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
            var screenCoords = {
                x:ev.pageX - offset.left,
                y:ev.pageY - offset.top
            };
            // BUG: scaling?
            var imageCoords = this.screenCoordsToPageCoords(screenCoords);
            console.log(screenCoords);
            console.log(imageCoords);
            events.trigger('cursorToCoordinate',imageCoords);
        },
        screenCoordsToPageCoords: function(coords) {
            return {
                x: (coords.x - this.originX) / (this.pageHRatio * this.pageScale), 
                y: (coords.y - this.originY) / (this.pageVRatio * this.pageScale), 
            }
        },
        pageCoordsToScreenCoords: function(coords) {
            var hScale = this.pageHRatio * this.pageScale;
            var vScale = this.pageVRatio * this.pageScale;
            return {
                x : Math.round(coords.x * hScale + this.originX) - 2,
                y : Math.round(coords.y * vScale + this.originY) - 2,
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

            // getImageData & putImageData work in screen coordinates and not
            // in canvas coordinates so transform
            var hScale = this.pageHRatio * this.pageScale;
            var vScale = this.pageVRatio * this.pageScale;
            var rect = {
                hpos : Math.round(hl.hpos * hScale + this.originX) - 2,
                vpos : Math.round(hl.vpos * vScale + this.originY) - 2,
                width : Math.round(hl.width * hScale) + 2,
                height : Math.round(hl.height * vScale) + 2,
            };

            // Start with what is already there.
            var imgd;
            try {
                imgd = ctx.getImageData(rect.hpos,rect.vpos,rect.width,rect.height);
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
    
            if (!this.image) { return; }

            this.pageHRatio = this.image.width;
            this.pageVRatio = this.image.height;
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

            this.renderHighlight(ctx,this.highlight);

        }
    });

    return {
        view: new View(),
        thumbnails: new Thumbnails(),
        empty: new EmptyView(),
    }

});
