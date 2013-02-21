define(['jquery','toolbar','events','mybackbone','container','alto'],
        function ($,toolbar,events,mybackbone,container,alto) {
    "use strict";

    var View = mybackbone.View.extend({

        initialize: function() {

            var that = this;
            this.layoutBoxes = [];

/*
            toolbar.registerButton({
                id:'show-layout',
                toggle:true,
                icon:'icon-th',
                title:'Show page layout',
                modes:['page'],
                toggleCB:function(newState) {
                    that.showLayout = newState;
                    if (newState) {
                        container.view.setMouseSensitivity(false);
                    } else {
                        container.view.setMouseSensitivity(true);
                    }
                    that.render();
                }});
*/
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

        },
        el: '#boxes',
        myEvents: {

            'changeCoordinates': 'setHighlightBoxes',
            'scheduledRender': 'render',
            'changePage': 'changePage'

        },
        events: {
            /*
            'click': 'click',
            'dblclick #boxes': 'clickOutsideBoxes',
            'click .layout-box': 'clickLayoutBox',
            'dblclick .layout-box': 'clickLayoutBox',
            'resize .layout-box': 'resizeLayoutBox',
            'drag .layout-box': 'dragLayoutBox',
            */
        },
        click: function (ev) {
            //console.log('c',ev);
        },
        dragLayoutBox: function (ev,ui) {
            var x = container.view.getPageX(ui.offset.left);
            var y = container.view.getPageY(ui.offset.top);
            //console.log(x,y);
        },
        resizeLayoutBox: function (ev,ui) {
            var offsetX = ui.position.left - this.$el.offset().left;
            var offsetY = ui.position.top - this.$el.offset().top;
            var x = container.view.getPageX(offsetX);
            var y = container.view.getPageY(offsetY);
            var w = container.view.getPageWidth(ui.size.width);
            var h = container.view.getPageHeight(ui.size.height);
            //console.log(x,y,w,h);
        },
        clickLayoutBox: function(ev) {
            if (ev.type == "dblclick") {
                $(ev.toElement).remove();
                //this.removeLayoutBox();
            } else if (ev.type == "click") {
                $('.selected-layout-box').removeClass('selected-layout-box');
                $(ev.toElement).addClass('selected-layout-box');
            }
        },
        clickOutsideBoxes: function(ev) {
            // create new layoutBox.

            if (ev.type=='dblclick') {
                var el = ev.toElement;

                var box = {
                    hpos: container.view.getPageX(ev.offsetX),
                    vpos: container.view.getPageY(ev.offsetY),
                    width: 100,
                    height: 100 
                };

                this.renderBoxes ([box],"layout-box",true);
                ev.stopPropagation();
            }
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
        renderBoxes : function(boxes,cls,editable) {
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
                };

                $div = $('<div> </div>');
                $div.attr('class',cls);
                $div.css('left',rect.hpos);
                $div.css('top',rect.vpos);
                $div.css('width',rect.width);
                $div.css('height',rect.height);
                $div.data(box);
                this.$el.append($div);


                if (editable) {
                    $div.resizable( {
                        handles: "n, ne, e, se, s, sw, w, nw"
                    } );
                    $div.draggable({ });
                }

            }

        },
        render: function() {
            this.$el.html('');

            if (this.showHighlight && this.highlight) {

                this.renderBoxes(this.highlight,"highlight-box");
                events.trigger('highlightBoxesRendered',this.highlight);

            }

            if (this.showLayout) {

                this.renderBoxes(this.layoutBoxes,"layout-box",true);
                events.trigger('layoutBoxesRendered',this.layoutBoxes);

            }

        }
    });

    return {
        view: new View()
    };

});

