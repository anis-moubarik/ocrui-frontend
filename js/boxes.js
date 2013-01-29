/*globals console:true setTimeout:false setInterval:false */
define(['jquery','toolbar','events','backbone','mousetailstack','container'],
        function ($,toolbar,events,Backbone,mousetailstack,container) {
    "use strict";

    var View = Backbone.View.extend({

        initialize: function() {

            var that = this;
            this.layoutBoxes = []
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
            events.on('changePageAlto',function(alto) {
                that.setLayoutBoxes(alto);
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

        setLayoutBoxes : function(alto) {
            this.layoutBoxes = alto.getLayoutBoxes();
        },
        createBox : function(rect,cls) {
            var $div = $('<div> </div>');
            $div.attr('class',cls);
            $div.css('left',rect.hpos);
            $div.css('top',rect.vpos);
            $div.css('width',rect.width);
            $div.css('height',rect.height);
            return $div;
        },
        render: function() {
            this.$el.html('');
            var hl = this.highlight;
            var box;
            var rect;

            if (this.showHighlight && this.highlight) {

                rect = {
                    hpos : container.view.getScreenX(hl.hpos)-3,
                    vpos : container.view.getScreenY(hl.vpos)-3,
                    width : container.view.getScreenWidth(hl.width)+6,
                    height : container.view.getScreenHeight(hl.height)+6
                }

                this.$el.append(this.createBox(rect,"highlight-box"));

            }

            if (this.showLayout) {

                for (var i in this.layoutBoxes) {

                    box = this.layoutBoxes[i];
                    rect = {
                        hpos : container.view.getScreenX(box.hpos)-3,
                        vpos : container.view.getScreenY(box.vpos)-3,
                        width : container.view.getScreenWidth(box.width)+6,
                        height : container.view.getScreenHeight(box.height)+6
                    }

                    this.$el.append(this.createBox(rect,"layout-box"));

                }

            }

        }
    });

    return {
        view: new View(),
    };

});

