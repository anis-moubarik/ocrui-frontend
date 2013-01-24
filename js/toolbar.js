/*globals $templates:false */
define(['jquery','underscore','events','mustache','backbone'],function ($,_,events,mustache,Backbone) {
    "use strict";

    // handle keyboard shortcuts also

    var keyboardShortcuts = {};
    var widgets = {};
    var buttons = {};

    function registerKeyboardShortcut(which,callback) {
        if (which in keyboardShortcuts) {
            throw "Trying to reregister shortcut for " + which;
        }
        keyboardShortcuts [which] = callback;
    }

    function registerWidget(data) {
        // widget is a backbone view that renders widget
        // modes is an array of modes in which this widget is active
        // toolbar takes care that widget.el exists when widget.render
        // is called

        var id = data.id;
        if (id in widgets) {
            throw "Trying to reregister widget " + id;
        }
        widgets [id] = data;
    }

    function registerButton(data) {
        // toggle makes button togleable, otherwise clickable
        // toolbar takes care of firing button-{{id}}-click,
        // events on clicks.

        var id = data.id;
        if (id in buttons) {
            throw "Trying to reregister button " + id;
        }
        buttons [id] = data;
    }

    $('body').on('keydown',function(ev) {
        var callback = keyboardShortcuts[ev.which];
        if (callback) {
            callback();
        }
    });

    var View = Backbone.View.extend({
        initialize: function() {
            var that = this
            this.mode = 'empty';
            events.on('changePage',function(pageNumber) {
                that.setMode('page');
                that.render();
            });
        },
        el : '#toolbar',
        events: {
            'click button': 'handleClick'
        },
        handleClick: function (ev) {
            var id = ev.currentTarget.id;
            var cb = buttons[id].click;
            cb.apply(ev.currentTarget,[ev]);

            var myEvent = 'button-'+id+'-clicked';
            events.trigger(myEvent);
        },
        setMode: function(mode) {
            this.mode = mode;
        },
        render: function() {
            
            var context = {
                widgets: _.map(widgets,function(w) { return w; }),
                buttons: _.map(buttons,function(b) { return b; })
            };
            var tpl = $templates.find('#toolbar-template').html();
            this.$el.html(mustache.render(tpl,context));

            for (var i in widgets) {
                //if (widgets[i].modes)
                var view = widgets[i].view;
                view.setElement('#' + i);
                view.render();
            }

            //this.$el.button(); // enable bootstrap button code
        }
    });

    var view = new View();
    return {
        view : view,
        registerKeyboardShortcut : registerKeyboardShortcut,
        registerWidget : registerWidget,
        registerButton : registerButton
    };

});
