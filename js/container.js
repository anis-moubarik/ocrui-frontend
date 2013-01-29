/*globals console:true setTimeout:false setInterval:false */
define(['underscore','jquery','toolbar','events','backbone','mousetailstack'],
        function (_,$,toolbar,events,Backbone,mousetailstack) {
    "use strict";

    var View = Backbone.View.extend({

        initialize: function() {

            var that = this;
            this.pageScale = 1; // 0.4; // some default...
            this.originX = 0; //
            this.originY = 0; //
            this.imageWidth = 500; // initial something
            this.imageHeight = 500; // initial something
            this.mouseTailStack = new mousetailstack.MouseTailStack();
            events.on('mousetail',function(data) {that.panTail(data);});

            toolbar.registerButton({
                id:'zoom-in',
                toggle:false,
                icon:'icon-zoom-in',
                title:'Zoom in',
                modes:['page'],
                click:function(data) {
                    var x = that.horizontalPixels / 2;
                    var y = that.verticalPixels / 2;
                    that.zoomTo(2,x,y);
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
                    that.zoomTo(0.5,x,y);
                }});

            toolbar.registerButton({
                id:'pan-zoom',
                toggle:true,
                icon:'icon-move',
                title:'Mouse wheel pan/zoom',
                modes:['page'],
                toggleCB:function(newState) {
                    that.wheelPan = newState;
                }});

            toolbar.registerKeyboardShortcut(113, function(ev) {
                $('#pan-zoom').click();
            });

            events.on('changeCoordinates',function(data) {
                that.possiblyScrollToHighlight(data);
            });

            events.on('changePageImage',function(image) {
                that.setImage(image);
                that.scheduleRender();
            });

            events.on('set-scaling', function() {
                that.scheduleRender ();
            });
            setInterval(function() {that.processRenderingRequests();},40);
        },
        el: '#facsimile-canvas',
        events: {
            'click': 'propagateClick',
            'mousewheel': 'wheel',
            'mousemove': 'pan',
            'mousedown': 'beginPan',
            'mouseup': 'endPan',
            'mouseout': 'endPan',
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
                this.scheduleRender();
            } else {
                if (delta > 0) {
                    this.zoomTo(1.5,x,y);
                } else {
                    this.zoomTo(0.75,x,y);
                }
            }
        },

        beginPan: function(ev) {
            this.propageteNextClick = true;
            this.panning = true;
            this.mouseTailStack.init(ev);
            this.savedOriginX = this.originX;
            this.savedOriginY = this.originY;

            var offset = this.$el.offset();
            this.panBeginX = ev.pageX - offset.left;
            this.panBeginY = ev.pageY - offset.top;
            ev.preventDefault();
            ev.stopPropagation();
        },
        endPan: function(ev) {
            this.mouseTailStack.end(ev);
            this.panning = false;
        },
        cancelPan: function(ev) {

            if (!this.panning) return;
            this.setOrigin(this.savedOriginX, this.savedOriginY);
            this.scheduleRender();
            this.panning = false;

        },
        pan: function(ev) {
            this.propageteNextClick = false;
            if (!this.panning) { return; }
            this.mouseTailStack.push(ev);
            var offset = this.$el.offset();
            var currentX = ev.pageX - offset.left;
            var currentY = ev.pageY - offset.top;

            this.setOrigin(
                this.savedOriginX - (this.panBeginX - currentX),
                this.savedOriginY - (this.panBeginY - currentY));
            this.scheduleRender();

        },
        panTail: function(data) {
            this.setOrigin(
                this.originX + data[0],
                this.originY + data[1]);
            this.scheduleRender();
        },
        propagateClick: function(ev) {
            if (!this.propageteNextClick) return;
            var offset = this.$el.offset();
            var screenCoords = {
                x:ev.pageX - offset.left,
                y:ev.pageY - offset.top
            };

            var hScale = this.imageWidth * this.pageScale;
            var vScale = this.imageHeight * this.pageScale;
            return {
                x: (screenCoords.x - this.originX) / hScale,
                y: (screenCoords.y - this.originY) / vScale
            };
            events.trigger('cursorToCoordinate',imageCoords);
        },
        getScreenX: function(pageX) {
            var hScale = this.imageWidth * this.pageScale;
            return Math.round(pageX * hScale + this.originX) - 2;
        },
        getScreenY: function(pageY) {
            var vScale = this.imageHeight * this.pageScale;
            return Math.round(pageY * vScale + this.originY) - 2;
        },
        getScreenWidth: function(pageWidth) {
            var hScale = this.imageWidth * this.pageScale;
            return Math.round(pageWidth * hScale) + 2;
        },
        getScreenHeight: function(pageHeight) {
            var vScale = this.imageHeight * this.pageScale;
            return Math.round(pageHeight * vScale) + 2;
        },
        setImage: function(image) {
            this.image = image;
        },
        possiblyScrollToHighlight: function(hl) {
            if (hl === undefined) return;
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

            var speed = 0.25; // speed of scroll 0 < speed <= 1
            var timeout = 40; // => about 25 frames per sec
            var margin = 50;

            if ((xx === 0) && (yy === 0)) {
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

            // setup scroll

            var that = this;

            if (this.scrollingTo === undefined) {
                setTimeout(function() {that.scrollOneStep(speed,margin,timeout);},timeout);
            }

            this.scrollingTo = {x:scrollToX,y:scrollToY};

        },
        scrollOneStep: function (speed,margin,timeout) {
            var that = this;
            var xDelta = Math.ceil(this.inVisibleX(this.scrollingTo.x,margin) * speed);
            var yDelta = Math.ceil(this.inVisibleY(this.scrollingTo.y,margin) * speed);
            this.setOrigin(this.originX - xDelta, this.originY - yDelta);
            this.scheduleRender();
            if ((xDelta !== 0) || (yDelta !== 0)) {
                setTimeout(function() {that.scrollOneStep(speed,margin,timeout);},timeout);
            } else {
                this.scrollingTo = undefined;
            }
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
        zoomTo: function(amount,fixedX,fixedY) {
            var scale = this.pageScale * amount;
            if (scale < 0.01) scale = 0.01;
            if (scale > 2) scale = 2;

            var oldScale = this.pageScale;

            this.setZoom(scale);

            var newScale = this.pageScale;

            // (fixedX, fixedY) on screen point that should remain fixed to a
            // point in page soon to be calculated

            var scaleChange = (newScale / oldScale);
            var ofX = fixedX - this.originX;
            var ofY = fixedY - this.originY;
            var newOfX = ofX * scaleChange;
            var newOfY = ofY * scaleChange;
            var newOriginX = fixedX - newOfX;
            var newOriginY = fixedY - newOfY;

            this.setOrigin( newOriginX, newOriginY);

            this.scheduleRender();
        },
        setZoom: function (newScale) {
            // TODO: don't let zoom too far

            var margin = 100;
            var canvasLeft = -this.originX;
            var canvasTop = -this.originY;
            var canvasRight = canvasLeft + this.horizontalPixels;
            var canvasBottom = canvasTop + this.verticalPixels;
            var pageLeft = 0 * newScale;
            var pageTop = 0 * newScale;
            var pageRight = this.imageWidth * newScale;
            var pageBottom = this.imageHeight * newScale;
            var pageMarginLeft = pageLeft - margin;
            var pageMarginTop = pageTop - margin;
            var pageMarginRight = pageRight + margin;
            var pageMarginBottom = pageBottom + margin;

            
            var canvasWidth = canvasRight - canvasLeft;
            var canvasHeight = canvasBottom - canvasTop;
            var pageMarginWidth = pageMarginRight - pageMarginLeft;
            var pageMarginHeight = pageMarginBottom - pageMarginTop;

            // this computes minimum scales based on horizontal and vertical widths.
            var newHScale = (canvasWidth - margin * 2) / this.imageWidth;
            var newVScale = (canvasHeight - margin * 2) / this.imageHeight;

            // select maximum of requested scale and two minimums
            this.pageScale = _.max([newScale,newHScale,newVScale]);
        },
        setOrigin: function (originX,originY) {
            this.originX = parseInt(originX,10); // logical coordinate origin for panning
            this.originY = parseInt(originY,10); // logical coordinate origin for panning

            // Don't let user scroll too far
            // Count bounding boxes of canvas and page in pixels from originX,originY.

            var margin = 100; // acceptable margin
            var canvasLeft = -this.originX;
            var canvasTop = -this.originY;
            var canvasRight = canvasLeft + this.horizontalPixels;
            var canvasBottom = canvasTop + this.verticalPixels;
            var pageLeft = 0 * this.pageScale;
            var pageTop = 0 * this.pageScale;
            var pageRight = this.imageWidth * this.pageScale;
            var pageBottom = this.imageHeight * this.pageScale;
            var pageMarginLeft = pageLeft - margin;
            var pageMarginTop = pageTop - margin;
            var pageMarginRight = pageRight + margin;
            var pageMarginBottom = pageBottom + margin;

            if (canvasLeft < pageMarginLeft) {
                this.originX = - (pageLeft - margin);
            } else if (canvasRight > pageMarginRight) {
                this.originX = - (pageRight - this.horizontalPixels + margin);
            }

            if (canvasTop < pageMarginTop) {
                this.originY = - (pageTop - margin);
            } else if (canvasBottom > pageMarginBottom) {
                this.originY = - ( pageBottom - this.verticalPixels + margin);
            }

        },
        setPixels: function (horizontal, vertical) {
            this.horizontalPixels = parseInt(horizontal,10);
            this.verticalPixels = parseInt(vertical,10);
        },
        scheduleRender: function () {
            this.requestRendering = true;
        },
        processRenderingRequests: function() {
            if (this.requestRendering === false) return;
            this.requestRendering = false;
            this.render();
        },
        render: function() {

            return;

        }

    });

    return {
        //view: new View(),
    };

});

