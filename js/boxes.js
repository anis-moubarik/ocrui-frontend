define(['jquery','toolbar','events','mybackbone','container','alto',],
        function ($,toolbar,events,mybackbone,container,alto) {
    "use strict";

    var View = mybackbone.View.extend({

        initialize: function() {

            var that = this;
            this.layoutBoxes = []

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
                    if (newState) {
                        that.$el.addClass('pass-pointer-events');
                    } else {
                        that.$el.removeClass('pass-pointer-events');
                    }
                    that.render();
                }});

        },
        el: '#boxes',
        myEvents: {

            'changeCoordinates': 'setHighlightBoxes',
            'scheduledRender': 'render',
            'changePage': 'changePage',

        },
        events: {
        },

        changePage: function(attributes) {
            var that = this;
            this.attributes = attributes;
            alto.get(attributes).then(
                function(myAlto) {
                    /* if (this.attributes != attributes) return;*/
                    that.layoutBoxes = myAlto.getLayoutBoxes();
                    that.render();
                },
                function(msg) {
                    that.layoutBoxes = [];
                    that.render();
                }
            );
        },
        setHighlightBoxes : function(data) {
            this.highlight = data;
            this.render();
        },
        renderBoxes : function(boxes,cls) {
            var box;
            var rect;
            var $div;

            for (var i in boxes) {

                box = boxes[i];
                rect = {
                    hpos : container.view.getScreenX(box.hpos)-3,
                    vpos : container.view.getScreenY(box.vpos)-3,
                    width : container.view.getScreenWidth(box.width)+6,
                    height : container.view.getScreenHeight(box.height)+6
                }

                $div = $('<div> </div>');
                $div.attr('class',cls);
                $div.css('left',rect.hpos);
                $div.css('top',rect.vpos);
                $div.css('width',rect.width);
                $div.css('height',rect.height);
                //$div.resizable();
                this.$el.append($div);

            }

        },
        render: function() {
            this.$el.html('');

            if (this.showHighlight && this.highlight) {

                this.renderBoxes(this.highlight,"highlight-box");
                events.trigger('highlightBoxesRendered',this.highlight);

            }

            if (this.showLayout) {

                this.renderBoxes(this.layoutBoxes,"layout-box");
                events.trigger('layoutBoxesRendered',this.layoutBoxes);

            }

        }
    });

    return {
        view: new View(),
    };

});

