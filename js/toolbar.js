define(['jquery','underscore','events','mustache','mybackbone','conf', "text!../templates/toolbar.html", "qtip", "editor"],
        function ($,_,events,mustache,mybackbone,conf,toolbartpl, qtip, ed) {
    "use strict";

    // handle keyboard shortcuts also

    var keyboardShortcuts = {};
    var widgets = {};
    var buttons = {};
    var editors = {};
    var colors = [];

    function randColor() {
        return "#"+Math.floor(Math.random()*16777215).toString(16);
    }

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

    function ping(){
        var re = new RegExp("[0-9a-f]{32}");
        var uidarr = re.exec(document.URL);
        var uid = uidarr[0]
        var options = {
            type:'GET',
            url: "/api/id/"+uid+"/ping",
            statusCode: {
                401: function() {events.trigger("saveFailed401", 'pinging the backend')},
                403: function() {events.trigger("saveFailed", 'Forbidden')},
            }
        }
        var readonly = false;
        $.ajax(options)
            .done(function(data){
                console.log(data)
                if(data.code == 13){
                    console.log("ReadOnly");
                    readonly = true;
                    ed.setCMOption("readOnly", true);
                }
                editors = data.users;
                for(var editor in editors){
                    if(colors[editor] == null) {
                        colors[editor] = randColor();
                    }
                }
                view.render(readonly);


            })
    }
    var View = mybackbone.View.extend({
        initialize: function() {
            // we must wait for editor before firing initial cbs
            // BUG: race condition if user clicks between toolbar render
            // and editor render
            this._editorRendered = $.Deferred();
            conf.buttons.map(_.bind(this.registerButton,this));
            conf.shortcuts.map(_.bind(this.registerKeyboardShortcut,this));

            ping();
            (function(view){
                window.setInterval(function(){
                    ping();
                }, 30000);
            })(this)
        },
        el : '#toolbar',
        myEvents: {
            'changeMode': 'changeMode',
            'editorRendered': 'editorRendered'
        },
        events: {
            'click button': 'handleClick'
        },
        myModes: ['page','document'],
        setViewActive: function (mode) {
            this.render();
        },
        handleTag: function(event){
            var ch = event.currentTarget.getAttribute('data-character');
            console.log(ch)
            events.trigger("tagWord")
        },
        editorRendered: function () {
            this._editorRendered.resolve();
        },
        registerKeyboardShortcut: function (shortcut) {
            if (shortcut.which in keyboardShortcuts) {
                throw "Trying to reregister shortcut for " + shortcut.code;
            }
            for (var i in shortcut.modes) {
                var mode = shortcut.modes[i];
                var key = mode+'-'+shortcut.code;
                keyboardShortcuts [key] = shortcut.event;
                // console.log(shortcut)
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
                this._editorRendered.done( function () {
                    events.trigger(data.event,data.active);
                });
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
                events.trigger(b.event, ev);
            }

            events.trigger('refocus');

            var myEvent = 'button-'+id+'-clicked';
            events.trigger(myEvent);
        },
        render: function(opt) {
            var that = this;
            var buttonArray = buttons;
            if(opt){
                buttonArray = _.filter(buttons, function(obj){
                    return obj.id != "save";
                });
            }
            var context = {
                widgets: _.map(widgets, function (w) {
                    return w;
                }),
                buttons: _.map(buttonArray, function (b) {
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

                }),
                userbox: _.map(editors, function (e, key) {
                    return {
                        user: key,
                        color: colors[key]
                    };
                })
            };
            context.widgets.sort(itemSort);
            context.buttons.sort(itemSort);
            console.log(context);

            this.$el.html(mustache.render(toolbartpl,context));

            for (var i in widgets) {
                //if (widgets[i].modes)
                var view = widgets[i].view;
                view.setElement('#' + i);
                view.render();
            }
            $(".userbox").qtip({
                content:{
                    attr: 'data-tooltip'
                }
            });
            //this.$el.button(); // enable bootstrap button code
        }
    });

    var view = new View();
    return {
        view : view,
        registerWidget : registerWidget
    };

});
