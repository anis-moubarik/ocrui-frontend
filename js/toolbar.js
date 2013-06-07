define(['jquery','underscore','events','mustache','mybackbone','templates','conf'],
        function ($,_,events,mustache,mybackbone,templates,conf) {
    "use strict";

    // handle keyboard shortcuts also

    var keyboardShortcuts = {};
    var widgets = {};
    var buttons = {};

    function itemSort(a,b) {
        if ( ( a.index === undefined ) && (b.index === undefined) ) return 0;

        if ( ( a.index !== undefined ) && (b.index === undefined) ) return 1;

        if ( ( a.index === undefined ) && (b.index !== undefined) ) return -1;

        return a.index - b.index;
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

    $('body').on('keydown',function(ev) {
        var key = view.mode+'-'+ev.which;
        var event = keyboardShortcuts[key];
        if (event) {
            events.trigger(event);
        }
    });

    var View = mybackbone.View.extend({
        initialize: function() {
            conf.buttons.map(this.registerButton);
            conf.shortcuts.map(this.registerKeyboardShortcut);
        },
        el : '#toolbar',
        myEvents: {
            'changeMode': 'changeMode'
        },
        events: {
            'click button': 'handleClick'
        },
        myModes: ['page','document'],
        setViewActive: function (mode) {
            this.render();
        },
        registerKeyboardShortcut: function (shortcut) {
            if (shortcut.which in keyboardShortcuts) {
                throw "Trying to reregister shortcut for " + shortcut.code;
            }
            for (var i in shortcut.modes) {
                var mode = shortcut.modes[i];
                var key = mode+'-'+shortcut.code;
                keyboardShortcuts [key] = shortcut.event;
                console.log(shortcut)
            }
        },

        registerButton: function (data) {
            var id = data.id;
            if (data.index === undefined) {
                throw 'Sort index must be given for buttons.';
            }
            if (id in buttons) {
                throw "Trying to reregister button " + id;
            }
            buttons [id] = data;
            if (data.toggle && (!data.suppressInitialCB)) {
                events.trigger(data.event,data.active);
            }
        },
        handleClick: function (ev) {
            var id = ev.currentTarget.id;
            var b = buttons[id];
            if (b === undefined) return;
            if (b.modes.indexOf(this.currentMode()) == -1) return;
            if (b.toggle) {
                var toggled = !($(ev.currentTarget).hasClass("active"));
                events.trigger(b.event,toggled);
            } else {
                events.trigger(b.event);
            }

            events.trigger('refocus');

            var myEvent = 'button-'+id+'-clicked';
            events.trigger(myEvent);
        },
        render: function() {
            
            var that = this;
            var context = {
                widgets: _.map(widgets,function(w) { return w; }),
                buttons: _.map(buttons,function(b) {
                    return {
                        id: b.id,
                        index: b.index,
                        classes: 'btn' +
                                 (b.active ? ' active' : '') +
                                 (b.modes.indexOf(that.mode) != -1 ?
                                  '' :
                                  ' disabled'),
                        extra: b.toggle && 'data-toggle="button"' || '',
                        icon: b.icon,
                        title: b.title,
                        text: b.text
                    };
                })
            };
            context.widgets.sort(itemSort);
            context.buttons.sort(itemSort);
            var tpl = templates.get('toolbar');
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
        registerWidget : registerWidget,
    };

});
