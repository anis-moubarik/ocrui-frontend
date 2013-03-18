define(['jquery','toolbar','events','mybackbone','container','alto'],
        function ($,toolbar,events,mybackbone,container,alto) {
    "use strict";

    var View = mybackbone.View.extend({

        initialize: function() {

            var that = this;
            this.layoutBoxes = [];

            /*
            toolbar.registerButton({
                id:'edit-layout',
                toggle:true,
                icon:'icon-th',
                title:'Edit page layout',
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
            'changeMode': 'changeMode',
            'changePage': 'changePage'

        },
        /*
        events: {
            'click': 'click',
            'dblclick': 'click',
            'click .layout-box': 'clickLayoutBox',
            'dblclick .layout-box': 'clickLayoutBox',
            'resize .layout-box': 'resizeLayoutBox',
            'drag .layout-box': 'dragLayoutBox',
        },
        */
        myModes: ['page'],
        click: function (ev) {

            if (ev.type=='dblclick') {
                // create new layoutBox.
                console.log('c');
                var el = ev.toElement;

                var box = {
                    hpos: container.cm.getOnPageX(ev.offsetX),
                    vpos: container.cm.getOnPageY(ev.offsetY),
                    width: 100,
                    height: 100 
                };

                this.renderBoxes ([box],"layout-box",true);
                ev.stopPropagation();
            }
        },
        dragLayoutBox: function (ev,ui) {
            var x = container.cm.getOnPageX(ui.offset.left);
            var y = container.cm.getOnPageY(ui.offset.top);
        },
        resizeLayoutBox: function (ev,ui) {
            var offsetX = ui.position.left - this.$el.offset().left;
            var offsetY = ui.position.top - this.$el.offset().top;
            var x = container.cm.getOnPageX(offsetX);
            var y = container.cm.getOnPageY(offsetY);
            var w = container.cm.getOnPageWidth(ui.size.width);
            var h = container.cm.getOnPageHeight(ui.size.height);
        },
        clickLayoutBox: function(ev) {
            if (ev.type == "dblclick") {
                $(ev.toElement).remove();
                //this.removeLayoutBox();
            } else if (ev.type == "click") {
                $('.selected-layout-box').removeClass('selected-layout-box');
                $(ev.toElement).addClass('selected-layout-box');
            }
            ev.stopPropagation();
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
            this.highlight = [];
            for (var i in data) {
                var w = data[i];
                this.highlight.push({
                    hpos: w.hpos,
                    vpos: w.vpos,
                    width: w.width,
                    height: w.height,
                });
                if (w.hyphenated) {
                    this.highlight.push({
                        hpos: w.hpos2,
                        vpos: w.vpos2,
                        width: w.width2,
                        height: w.height2,
                    });
                }
            }

            this.render();
        },
        renderBoxes : function(boxes,cls,editable) {
            var box;
            var rect;
            var $div;

            for (var i in boxes) {

                box = boxes[i];
                rect = {
                    hpos : container.cm.getPageScale() * (box.hpos),
                    vpos : container.cm.getPageScale() * (box.vpos),
                    width : container.cm.getPageScale() * (box.width),
                    height : container.cm.getPageScale() * (box.height)
                };

                $div = $('<div> </div>');
                $div.attr('class',cls);
                $div.css('left',rect.hpos);
                $div.css('top',rect.vpos);
                $div.css('width',rect.width);
                $div.css('height',rect.height);
                $div.data(box);
                //console.log(JSON.stringify(rect));
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
            this.$el.css('top',container.cm.getPageTop());
            this.$el.css('left',container.cm.getPageLeft());
            this.$el.css('width',container.cm.getPageWidth());
            this.$el.css('height',container.cm.getPageHeight());

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

