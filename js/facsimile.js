/*globals console:true setTimeout:false */
define(['jquery','toolbar','events','backbone'],function ($,toolbar,events,Backbone) {
    "use strict";

    var EmptyView = Backbone.View.extend({
        el: '#editor',
        render: function() {
            this.$el.html("<div>empty</div>");
        }
    });

    var Thumbnails = Backbone.View.extend({
        el: '#facsimile',
        render: function() {
            var $canvas = $('<canvas id="facsimile-canvas">HTML canvas required.</canvas>');
            $canvas.attr(this.horizontalPixels,'width');
            $canvas.attr(this.verticalPixels,'height');
            this.$el.html('');
            this.$el.append($canvas);
        }
    });

    var View = Backbone.View.extend({

        initialize: function() {

            var that = this;
            this.pageScale = 1; // 0.4; // some default...
            this.originX = 0; //
            this.originY = 0; //
            this.imageWidth = 500; // initial something
            this.imageHeight = 500; // initial something

            toolbar.registerButton({
                id:'zoom-in',
                toggle:false,
                icon:'icon-zoom-in',
                title:'Zoom in',
                modes:['page'],
                click:function(data) {
                    var x = that.horizontalPixels / 2;
                    var y = that.verticalPixels / 2;
                    that.adjustZoom(2,x,y);
                }});

            toolbar.registerButton({
                id:'zoom-out',
                toggle:false,
                icon:'icon-zoom-out',
                title:'Zoom out',
                modes:['page'],
                click:function(data) {
                    var x = that.horizontalPixels / 2;
                    var y = that.verticalPixels / 2;
                    that.adjustZoom(0.5,x,y);
                }});

            toolbar.registerButton({
                id:'pan-zoom',
                toggle:true,
                icon:'icon-move',
                title:'Mouse wheel pan/zoom',
                modes:['page'],
                click:function(data) {
                    var toggled = !($('#pan-zoom').hasClass("active"));
                    that.wheelPan = toggled;
                }});
            toolbar.registerKeyboardShortcut(113, function(ev) {
                $('#pan-zoom').click();
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
            'set-scaling': 'render'
        },
        adjustZoom: function(amount,fixedX,fixedY) {
            var scale = this.pageScale * amount;
            if (scale < 0.01) scale = 0.01;
            if (scale > 1) scale = 1;

            // (fixedX, fixedY) on screen point that should remain fixed to a
            // point in page soon to be calculated
            var scaleChange = (scale / this.pageScale);
            var ofX = fixedX - this.originX;
            var ofY = fixedY - this.originY;
            var newOfX = ofX * scaleChange;
            var newOfY = ofY * scaleChange;
            var newOriginX = fixedX - newOfX;
            var newOriginY = fixedY - newOfY;
            this.setOrigin( newOriginX, newOriginY);
            this.pageScale = scale;
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
            if (!this.panning) { return; }
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
            var offset = this.$el.offset();
            var screenCoords = {
                x:ev.pageX - offset.left,
                y:ev.pageY - offset.top
            };
            // BUG: scaling?
            var imageCoords = this.screenCoordsToPageCoords(screenCoords);
            events.trigger('cursorToCoordinate',imageCoords);
        },
        screenCoordsToPageCoords: function(coords) {
            return {
                x: (coords.x - this.originX) / (this.imageWidth * this.pageScale),
                y: (coords.y - this.originY) / (this.imageHeight * this.pageScale)
            };
        },
        pageCoordsToScreenCoords: function(coords) {
            var hScale = this.imageWidth * this.pageScale;
            var vScale = this.imageHeight * this.pageScale;
            return {
                x : Math.round(coords.x * hScale + this.originX) - 2,
                y : Math.round(coords.y * vScale + this.originY) - 2
            };
        },
        setImage: function(image) {
            this.image = image;
        },
        setHighlight: function(highlight) {
            // highlight is stored in image coordinates
            this.highlight = highlight;

            this.possiblyScrollToHighlight(highlight);
        },
        possiblyScrollToHighlight: function(hl) {
            var hScale = this.imageWidth * this.pageScale;
            var vScale = this.imageHeight * this.pageScale;

            var hpos = Math.round(hl.hpos * hScale);
            var vpos = Math.round(hl.vpos * vScale);
            var width = Math.round(hl.width * hScale);
            var height = Math.round(hl.height * vScale);
            var cX = hpos + width / 2;
            var cY = vpos + height / 2;
            var vLeft = -this.originX;
            var vTop = -this.originY;
            var vRight = vLeft + this.horizontalPixels;
            var vBottom = vTop + this.verticalPixels;
            var scrollToX = cX;
            var scrollToY = cY;

            var xx = this.inVisibleX(cX,margin);
            var yy = this.inVisibleY(cY,margin);

            var speed = 0.3 // speed of scroll 0 < speed <= 1
            var margin = 50;

            if ((xx == 0) && (yy == 0)) {
                return; // no need to scroll
            }

            // fit whole box to screen if possible otherwise just scroll thereabouts */
            if (width + 2*margin < this.horizontalPixels) {
                if (xx < 0) { scrollToX = hpos; }
                else if (xx > 0) { scrollToX = hpos + width; }
            }
            if (height + 2*margin < this.vertivalPixels) {
                if (yy < 0) { scrollToY = vpos; }
                else if (yy > 0) { scrollToY = vpos + height; }
            }

            this.setupScrollTo(scrollToX,scrollToY,speed,margin);

        },
        setupScrollTo: function (x,y,speed,margin) {

            var that = this;

            if (this.scrollingTo === undefined) {
                console.log('set');
                setTimeout(function() {that.scrollOneStep(speed,margin);},50);
            }
            else console.log('no set');

            this.scrollingTo = {x:x,y:y};

        },
        inVisibleX: function (x,margin) {
            if (margin === undefined) margin = 0;
            if (margin > this.horizontalPixels / 4) margin = this.horizontalPixels / 4;
            var left = -this.originX + margin;
            var right = left + this.horizontalPixels - (margin * 2);
            // return amount of pixels x is off the visible canvas
            if (x < left) {
                return x-left;
            } else if (x > right) {
                return x-right;
            } else {
                return 0;
            }
        },
        inVisibleY: function (y,margin) {
            // return amount of pixels y is off the visible canvas
            if (margin === undefined) margin = 0;
            if (margin > this.verticalPixels / 4) margin = this.verticalPixels / 4;
            var top = -this.originY + margin;
            var bottom = top + this.verticalPixels - (margin * 2);
            if (y < top) {
                return y - top;
            } else if (y > bottom) {
                return y - bottom;
            } else {
                return 0;
            }
        },
        scrollOneStep: function (speed,margin) {
            var that = this;
            var xDelta = Math.ceil(this.inVisibleX(this.scrollingTo.x,margin) * speed);
            var yDelta = Math.ceil(this.inVisibleY(this.scrollingTo.y,margin) * speed);
            this.setOrigin(this.originX - xDelta, this.originY - yDelta);
            this.render();
            if ((xDelta != 0) || (yDelta != 0)) {
                setTimeout(function() {that.scrollOneStep(speed,margin);},50);
            } else {
                this.scrollingTo = undefined;
            }
        },
        renderHighlight : function(ctx,hl) {
            if (!hl) { return; }

            //Draw semi transparent highlight box.

            // getImageData & putImageData work in screen coordinates and not
            // in canvas coordinates so transform
            var hScale = this.imageWidth * this.pageScale;
            var vScale = this.imageHeight * this.pageScale;
            var rect = {
                hpos : Math.round(hl.hpos * hScale + this.originX) - 2,
                vpos : Math.round(hl.vpos * vScale + this.originY) - 2,
                width : Math.round(hl.width * hScale) + 2,
                height : Math.round(hl.height * vScale) + 2
            };

            var cX = rect.hpos + rect.width / 2;
            var cY = rect.vpos + rect.height / 2;

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
            for (var i = 0, n = pix.length; i < n; i += 4) {
                var ix = Math.floor(i / 4) % rect.width;
                var iy = Math.floor(i / 4 / rect.width);
                if ( (ix === 0) || (ix === rect.width-1) ||
                        (iy === 0) || (iy === rect.height-1)) {
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
            this.originX = parseInt(originX); // logical coordinate origin for panning
            this.originY = parseInt(originY); // logical coordinate origin for panning
        },
        setPixels: function (horizontal, vertical) {
            this.horizontalPixels = parseInt(horizontal,10);
            this.verticalPixels = parseInt(vertical,10);
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

            this.renderHighlight(ctx,this.highlight);

        }
    });

    return {
        view: new View(),
        thumbnails: new Thumbnails(),
        empty: new EmptyView()
    };

});
