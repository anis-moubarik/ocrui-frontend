/*globals console:true setTimeout:false setInterval:false */
define(['jquery','toolbar','events','backbone','mousetailstack','container'],
        function ($,toolbar,events,Backbone,mousetailstack,container) {
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
                    that.render();
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
                    that.render();
                }});

            events.on('changeCoordinates',function(data) {
                that.highlight = data;
                that.render();
            });

            events.on('scheduledRender', function() {
                that.render();
            });

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
        render: function() {
            this.$el.html('');
            if (this.showHighlight && this.highlight) {

                var hl = this.highlight;

                var rect = {
                    hpos : container.view.getScreenX(hl.hpos)-2,
                    vpos : container.view.getScreenY(hl.vpos)-2,
                    width : container.view.getScreenWidth(hl.width)+2,
                    height : container.view.getScreenHeight(hl.height)+2
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

