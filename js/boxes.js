/*globals console:true setTimeout:false setInterval:false */
define(['jquery','toolbar','events','backbone','mousetailstack','facsimile'],
        function ($,toolbar,events,Backbone,mousetailstack,facsimile) {
    "use strict";

    var View = Backbone.View.extend({

        initialize: function() {

            var that = this;
            //events.on('mousetail',function(data) {that.panTail(data);});

            toolbar.registerButton({
                id:'show-layout',
                toggle:true,
                icon:'icon-th',
                title:'Show page layout',
                modes:['page'],
                toggleCB:function(newState) {
                    that.showLayout = newState;
                    that.scheduleRender();
                }});

            toolbar.registerButton({
                id:'show-highlight',
                toggle:true,
                active:true,
                icon:'icon-font',
                title:'Show editor word highlight',
                modes:['page'],
                toggleCB:function(newState) {
                    that.showHighlight = newState;
                    that.scheduleRender();
                }});

            events.on('changeCoordinates',function(data) {
                that.highlight = data;
                that.scheduleRender();
            });
            events.on('set-scaling', function() {
                that.scheduleRender ();
            });

            setInterval(function() {that.processRenderingRequests();},40);
        },
        el: '#boxes',
        events: {
/*            'click': 'propagateClick',
            'mousemove': 'pan',
            'mousedown': 'beginPan',
            'mouseup': 'endPan',
            'mouseout': 'endPan',
*/
        },

        renderLayout : function(ctx) {
            return;
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
            this.$el.html('');
            if (this.showHighlight && this.highlight) {

                var hl = this.highlight;

                var rect = {
                    hpos : facsimile.view.getScreenX(hl.hpos)-2,
                    vpos : facsimile.view.getScreenY(hl.vpos)-2,
                    width : facsimile.view.getScreenWidth(hl.width)+2,
                    height : facsimile.view.getScreenHeight(hl.height)+2
                }
                console.log('draw',rect);

                var $div = $('<div class="highlight-box"> </div>');
                $div.css('left',rect.hpos);
                $div.css('top',rect.vpos);
                $div.css('width',rect.width);
                $div.css('height',rect.height);
                this.$el.append($div);

            }

            if (this.showLayout) this.renderLayout();

        }
    });

    return {
        view: new View(),
    };

});

