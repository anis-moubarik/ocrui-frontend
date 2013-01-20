define(['events','mustache','backbone'],function (events,mustache) {

    // handle keyboard shortcuts also

    var keyboardShortcuts = {};
    var widgets = {};
    var buttons = {};

    function registerKeyboardShortcut(which,callback) {
        if (which in keyboardShortcuts) {
            throw "Trying to reregister shortcut for " + which;
        }
        keyboardShortcuts [which] = callback;
    };

    function registerWidget(id,widget,modes) {
        // widget is a backbone view that renders widget
        // modes is an array of modes in which this widget is active
        // toolbar takes care that widget.el exists when widget.render
        // is called

        if (id in widgets) {
            throw "Trying to reregister widget " + id;
        }
        widgets [id] = {
            view: widget,
            modes: modes,
        }
    };

    function registerButton(id,toggle,icon,modes) {
        // toggle makes button togleable, otherwise clickable
        // toolbar takes care of firing button-{{id}}-click,
        // events on clicks.

        if (id in buttons) {
            throw "Trying to reregister button " + id;
        }
        buttons [id] = {
            id: id,
            toggle: toggle,
            icon: icon,
            modes: modes,
        }
    };

    $('body').on('keydown',function(ev) {
        var callback = keyboardShortcuts[ev.which];
        if (callback) {
            callback();
        }
    });

    var View = Backbone.View.extend({
        initialize: function() {
            this.mode = 'empty';
        },
        el : '#toolbar',
        events: {
            'click button': 'handleClick'
        },
        handleClick: function (ev) {
            var id = ev.currentTarget.id
            var myEvent = 'button-'+id+'-clicked';
            events.trigger(myEvent);
        },
        setMode: function(mode) {
            this.mode = mode;
        },
        render: function() {
            
            var context = {
                widgets: _.map(widgets,function(w,i) { return i; }),
                buttons: _.map(buttons,function(b) { return b; }),
            };
            var tpl = $templates.find('#toolbar-template').html();
            this.$el.html(mustache.render(tpl,context));

            for (var i in widgets) {
                //if (widgets[i].modes)
                var view = widgets[i].view;
                view.setElement('#' + i);
                view.render();
            };

            //this.$el.button(); // enable bootstrap button code
        }
    });

    var view = new View();
    return {
        view : view,
        registerKeyboardShortcut : registerKeyboardShortcut,
        registerWidget : registerWidget,
        registerButton : registerButton
    }

});
