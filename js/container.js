define(['underscore','jquery','toolbar','events','mybackbone','mousetailstack','utils'],
        function (_,$,toolbar,events,mybackbone,mousetailstack,utils) {
    "use strict";

    var View = mybackbone.View.extend({

        initialize: function() {

            var that = this;
            this.pageScale = 1; // 0.4; // some default...
            this.margin = 100;
            this.pageLeft = this.margin;
            this.pageTop = this.margin;
            this.viewportLeft = 0;
            this.viewportTop = 0;
            this.imageWidth = 500; // initial something
            this.imageHeight = 500; // initial something
            this.altoWidth = 500; // these are the alto coordinates
            this.altoHeight = 500; // these are the alto coordinates
            this.maxAltoWidth = 500;
            this.maxAltoHeight = 500;
            this.pageWidth = 500; // these are in pixels on screen
            this.pageHeight = 500; // these are in pixels on screen
            this.mouseTailStack = new mousetailstack.MouseTailStack();

            toolbar.registerButton({
                id:'zoom-in',
                toggle:false,
                icon:'icon-zoom-in',
                title:'Zoom in',
                modes:['page'],
                click:function(data) { that.zoomTo(2); }
            });

            toolbar.registerButton({
                id:'zoom-out',
                toggle:false,
                icon:'icon-zoom-out',
                title:'Zoom out',
                modes:['page'],
                click:function(data) { that.zoomTo(0.5); }
            
            });

            toolbar.registerButton({
                id:'pan-zoom',
                toggle:true,
                icon:'icon-move',
                title:'Mouse wheel pan/zoom',
                modes:['page'],
                toggleCB:function(newState) {
                    that.wheelPan = newState;
            }});

            toolbar.registerKeyboardShortcut(113, ['page'], function(ev) {
                $('#pan-zoom').click();
            });
            this.setMouseSensitivity(true);

        },
        el: '#facsimile-container',
        myEvents: {
            'changeCoordinates':'possiblyScrollToHighlight',
            'setGeometry': 'setGeometry',
            'newViewportRequest' : 'newViewportRequest',
            'mousetail' : 'panTail',
            'setPageGeometry':'setPageGeometry',
            'changeImage':'changeImage',
            'changePage':'changePage',
            'changeMode':'changeMode',
            'scrollOneStep':'scrollOneStep',
            'scheduledRender':'render'
        },
        events: {
            'click': 'propagateClick',
            'mousewheel': 'wheel',
            'mousemove': 'pan',
            'mousedown': 'beginPan',
            'mouseup': 'endPan',
            'mouseout': 'endPan'
        },
        myModes: ['page'],
        setPageGeometry: function(data) {
            this.altoWidth = data.width;
            this.altoHeight = data.height;
            this.pageWidth = data.width * this.pageScale;
            this.pageHeight = data.height * this.pageScale;
            if (this.altoWidth > this.maxAltoWidth) {
                this.maxAltoWidth = this.altoWidth;
            }
            if (this.altoHeight > this.maxAltoHeight) {
                this.maxAltoHeight = this.altoHeight;
            }
        },
        setLayoutVertical: function(vertical) {
            this.vertical = vertical ? true : false;
        },
        isLayoutVertical: function () {
            return this.vertical;
        },
        setGeometry: function(data) {
            this.setLayoutVertical(data.vertical);
            this.horizontalPixels = data.facsimileWidth;
            this.verticalPixels = data.facsimileHeight;
            this.setZoom(this.pageScale);
            this.scheduleRender ();
        },
        setMouseSensitivity: function(b) {
            this.mouseSensitivity = b ? true : false;
        },
        newViewportRequest: function(vp) {
            this.setPan(vp.originX,vp.originY);
            this.setZoom(vp.pageScale);
            this.scrollingTo = undefined;
            this.scheduleRender();
        },
        wheel: function(ev,delta,deltaX,deltaY) {
            if (!this.mouseSensitivity) return;
            var offset = this.$el.offset();
            var x = ev.pageX - offset.left;
            var y = ev.pageY - offset.top;
            if (this.wheelPan) {
                this.setPan(
                        this.viewportLeft - 32*deltaX,
                        this.viewportTop - 32*deltaY
                    );
                this.scheduleRender();
            } else {
                if (delta > 0) {
                    this.zoomTo(1.4,x,y);
                } else {
                    this.zoomTo(1/1.4,x,y);
                }
            }
            ev.preventDefault();
        },

        beginPan: function(ev) {
            
            if (!this.mouseSensitivity) return;
            if (ev.which != 1) return;
            this.propageteNextClick = true;
            this.panning = true;
            this.mouseTailStack.init(ev);
            this.savedOriginX = this.viewportLeft;
            this.savedOriginY = this.viewportTop;

            var offset = this.$el.offset();
            this.panBeginX = ev.pageX - offset.left;
            this.panBeginY = ev.pageY - offset.top;
            ev.preventDefault();
            ev.stopPropagation();
        },
        endPan: function(ev) {
            if (!this.mouseSensitivity) return;
            this.mouseTailStack.end(ev);
            this.panning = false;
        },
        cancelPan: function(ev) {
            if (!this.mouseSensitivity) return;
            if (!this.panning) return;
            this.setPan(this.savedOriginX, this.savedOriginY);
            this.scheduleRender();
            this.panning = false;

        },
        pan: function(ev) {
            if (!this.mouseSensitivity) return;
            this.propageteNextClick = false;
            if (!this.panning) { return; }
            this.mouseTailStack.push(ev);
            var offset = this.$el.offset();
            var currentX = ev.pageX - offset.left;
            var currentY = ev.pageY - offset.top;

            var panX = this.savedOriginX + (this.panBeginX - currentX);
            var panY = this.savedOriginY + (this.panBeginY - currentY);
            this.setPan(panX, panY);
            this.scheduleRender();

        },
        panTail: function(data) {
            if (!this.mouseSensitivity) return;
            this.setPan(
                this.viewportLeft - data[0],
                this.viewportTop - data[1]);
            this.scheduleRender();
        },
        propagateClick: function(ev) {
            if (!this.mouseSensitivity) return;
            if (!this.propageteNextClick) return;
            if (ev.which != 1) return;

            var pageCoords = {
                x: this.viewport2AltoX(ev.pageX-this.$el.offset().left),
                y: this.viewport2AltoY(ev.pageY-this.$el.offset().top)
            };
            events.trigger('cursorToCoordinate',pageCoords);
        },
        getWorldLeft: function () {
            return 0;
        },
        getWorldTop: function () {
            return 0;
        },
        getWorldWidth: function () {
            return this.getMaxPageWidth() + 2 * this.margin;
        },
        getWorldHeight: function () {
            var nPages = 1;
            return nPages * (this.getMaxPageHeight() + this.margin) +
                this.margin;
        },
        getWorldBottom: function () {
            return this.getWorldHeight();
        },
        getWorldRight: function () {
            return this.getWorldWidth();
        },
        getViewportLeft: function() {
            return this.viewportLeft;
        },
        getViewportTop: function() {
            return this.viewportTop;
        },
        getViewportRight: function() {
            return this.horizontalPixels + this.viewportLeft;
        },
        getViewportBottom: function() {
            return this.verticalPixels + this.viewportTop;
        },
        getViewportWidth: function() {
            return this.horizontalPixels;
        },
        getViewportHeight: function() {
            return this.verticalPixels;
        },
        getPageLeft: function() {
            return this.pageLeft;
        },
        getPageTop: function() {
            return this.pageTop;
        },
        getPageRight: function() {
            return this.pageLeft + this.getPageWidth();
        },
        getPageBottom: function() {
            return this.pageTop + this.getPageHeight();
        },
        getPageWidth: function() {
            return this.pageWidth;
        },
        getPageHeight: function() {
            return this.pageHeight;
        },
        getMaxPageWidth: function() {
            return this.maxAltoWidth * this.pageScale;
        },
        getMaxPageHeight: function() {
            return this.maxAltoHeight * this.pageScale;
        },
        getPageScale: function () {
            return this.pageScale;
        },
        getOnPageWidth: function (screenWidth) {
            return screenWidth / this.pageScale();
        },
        getOnPageHeight: function (screenHeight) {
            return screenHeight / this.pageScale();
        },
        getOnPageX: function (worldX) {
            return (worldX - this.pageLeft) / this.pageScale;
        },
        getOnPageY: function (worldY) {
            return (worldY - this.pageTop) / this.pageScale;
        },
        viewport2AltoX: function (viewportX) {
            return (viewportX + this.viewportLeft - this.pageLeft) / this.pageScale;
        },
        viewport2AltoY: function (viewportY) {
            return (viewportY + this.viewportTop - this.pageTop) / this.pageScale;
        },
        alto2WorldX: function(altoX) {
            return Math.round(altoX * this.pageScale + this.pageLeft);
        },
        alto2WorldY: function(altoY) {
            return Math.round(altoY * this.pageScale + this.pageTop);
        },
        alto2WorldWidth: function(altoWidth) {
            return Math.round(altoWidth * this.pageScale);
        },
        alto2WorldHeight: function(altoHeight) {
            return Math.round(altoHeight * this.pageScale);
        },
        changePage: function() {
            this.initialHighlightSet = false;
        },
        possiblyScrollToHighlight: function(highlight) {
            if (highlight === []) return;
            if (!this.initialHighlightSet) {
                /* don't scroll on initial highlight of a page */
                this.initialHighlightSet = true;
                return;
            }

            var hl = utils.getCombinedBoundingBox(highlight);

            // combined box is still in alto coordinates so scale and then
            // think about scrolling
            this.scrollOneStep( {
                hpos: this.alto2WorldX(hl.hpos),
                vpos: this.alto2WorldY(hl.vpos),
                width: this.alto2WorldWidth(hl.width),
                height: this.alto2WorldHeight(hl.height),
            } );
        },
        scrollOneStep: function(hl) {

            var scrollSpeed = 0.25; // speed of scroll 0 < speed <= 1
            var scrollTimeout = 40; // => about 25 frames per sec
            var scrollHMargin = Math.min(50, this.getViewportWidth() / 4);
            var scrollVMargin = Math.min(50, this.getViewportHeight() / 4);

            function inVisibleX(xLeft,xRight,vpLeft,vpRight) {
                var left = vpLeft + scrollHMargin;
                var right = vpRight - scrollHMargin;

                if (right-left < xRight-xLeft) {
                    // won't fit to vp with margin, try without.
                    left = vpLeft;
                    right = vpRight;

                }

                if (right-left < xRight-xLeft) {
                    // won't fit to vp at all, just use the center point
                    xLeft = xLeft + (xRight-xLeft)/2;
                    xRight = xLeft;
                }

                // return amount of pixels x is off viewport + scroll margin
                if (xLeft < left) {
                    return xLeft-left;
                } else if (xRight > right) {
                    return xRight-right;
                } else {
                    return 0;
                }
            };

            function inVisibleY(xTop,xBottom,vpTop,vpBottom) {
                // return amount of pixels x is off viewport + scroll margin
                var top = vpTop + scrollVMargin;
                var bottom = vpBottom - scrollVMargin;

                if (bottom-top < xBottom-xTop) {
                    // won't fit to vp with margin, try without.
                    top = vpTop;
                    bottom = vpBottom;

                }

                if (bottom-top < xBottom-xTop) {
                    // won't fit to vp at all, just use the center point
                    xTop = xTop + (xBottom-xTop)/2;
                    xBottom = xTop;
                }

                if (xTop < top) {
                    return xTop - top;
                } else if (xBottom > bottom) {
                    return xBottom - bottom;
                } else {
                    return 0;
                }
            };

            if (hl) {
                // initial call

                var hpos = Math.round(this.getPageLeft() + hl.hpos * this.pageScale);
                var vpos = Math.round(this.getPageTop() + hl.vpos * this.pageScale);
                var width = Math.round(hl.width * this.pageScale);
                var height = Math.round(hl.height * this.pageScale);

                var xx = inVisibleX(
                    hl.hpos,
                    hl.hpos+hl.width,
                    this.getViewportLeft(),
                    this.getViewportRight());
                var yy = inVisibleY(
                    hl.vpos,
                    hl.vpos+hl.height,
                    this.getViewportTop(),
                    this.getViewportBottom());

                if ((xx === 0) && (yy === 0)) return;

                // setup scroll if it is not already setup
                if (this.scrollingTo === undefined) {
                    events.delay('scrollOneStep',undefined,scrollTimeout);
                }

                this.scrollingTo = {
                    left : this.getViewportLeft() + xx,
                    top : this.getViewportTop() + yy
                };

            }

            if (this.scrollingTo) {

                var xDelta = Math.ceil(
                        ( this.scrollingTo.left - this.getViewportLeft()) *
                        scrollSpeed
                    );
                var yDelta = Math.ceil(
                        (this.scrollingTo.top - this.getViewportTop()) *
                        scrollSpeed
                    );

                var newViewportLeft = this.getViewportLeft() + xDelta;
                var newViewportTop = this.getViewportTop() + yDelta;
                this.setPan(newViewportLeft,newViewportTop);
                    
                this.scheduleRender();
                if ((xDelta !== 0) || (yDelta !== 0)) {
                    events.delay('scrollOneStep',undefined,scrollTimeout);
                } else {
                    this.scrollingTo = undefined;
                }

            }
        },
        zoomTo: function(amount,fixedX,fixedY) {
            if (fixedX === undefined) {
                fixedX = this.horizontalPixels / 2;
            }
            if (fixedY === undefined) {
                fixedY = this.verticalPixels / 2;
            }

            var scale = this.pageScale * amount;
            if (scale < 0.01) scale = 0.01;
            if (scale > 2) scale = 2;

            if (this.oldPageScale === undefined) {
                this.fixedX = fixedX;
                this.fixedY = fixedY;
                this.oldPageScale = this.pageScale;
            }
            
            this.setZoom(scale);

            this.scheduleRender();
        },
        setZoom: function (newScale) {
            // TODO: don't let zoom too far

            //if (this.horizontalPixels > this.pageWidth + 2 * margin) return;
            //if (this.verticalPixels > this.pageHeight + 2 * margin) return;




            // compute minimum scales based on horizontal and vertical
            // widths.
            var minHScale = (this.getViewportWidth() - 2*this.margin) / this.altoWidth;
            var minVScale = (this.getViewportHeight() - 2*this.margin) / this.altoHeight;

            // select maximum of requested scale and two minimums
            this.pageScale = _.max([
                newScale,
                minHScale,
                minVScale
            ]);

            this.pageWidth = this.altoWidth * this.pageScale;
            this.pageHeight = this.altoHeight * this.pageScale;
            this.triggerNewViewport();
            

        },
        setPan: function (newLeft,newTop) {

            console.log('p',newLeft,newTop);
            // (newLeft,newTop) is the new coordinate of top left point of
            // viewport in relation to page coordinates. I.e.
            // coordinates are >= -margin and
            // <= this.imageWidth*scale - this.horizontalPixels + margin

            this.$el.scrollTop(newTop);
            this.$el.scrollLeft(newLeft);
            this.viewportTop = this.$el.scrollTop();
            this.viewportLeft = this.$el.scrollLeft();
            this.scheduleRender();
            this.triggerNewViewport();

        },

        triggerNewViewport: function() {
            events.delay('newViewport',{
                originX:this.pageLeft,
                originY:this.pageTop,
                pageScale:this.pageScale,
                vertical:this.isLayoutVertical()
            });
        },
        changeImage: function(image) {
            this.imageWidth = image.get('width');
            this.imageHeight = image.get('height');
            this.scheduleRender();
        },
        /*
        setNextImageSize: function(w,h) {
            this.nextImageWidth = w;
            this.nextImageHeight = h;
        },
        setPrevImageSize: function(w,h) {
            this.prevImageWidth = w;
            this.prevImageHeight = h;
        },
        */
        scheduleRender: function () {
            events.delayOrIgnore('scheduledRender',undefined,20);

        },
        render: function() {

            // change canvas scroll state if necessary. This is to keep a
            // chosen point fixed on screen
            if (this.oldPageScale !== undefined) {

                var newScale = this.pageScale;

                // (fixedX, fixedY) on screen point that should remain
                // fixed to a point in page soon to be calculated

                var scaleChange = (newScale / this.oldPageScale);

                // fixed point in pixels on canvas
                var onPageX = this.fixedX + this.getViewportLeft() -
                        this.getPageLeft();
                var onPageY = this.fixedY + this.getViewportTop() -
                        this.getPageTop();
                var newOnPageX = onPageX * scaleChange;
                var newOnPageY = onPageY * scaleChange;
                var newVPLeft = this.getPageLeft() + newOnPageX - this.fixedX;
                var newVPTop = this.getPageTop() + newOnPageY - this.fixedY;

                this.setPan( newVPLeft, newVPTop);
                delete this.oldPageScale;
                delete this.fixedX;
                delete this.fixedY;

            }

        }

    });

    return {
        view: new View()
    };

});

