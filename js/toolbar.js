define(['mustache','backbone'],function (mustache) {

    // handle keyboard shortcuts also

    var keyboardShortcuts = {};

    function registerKeyboardShortcut(which,callback) {
        if (which in keyboardShortcuts) {
            throw "Trying to reregister shortcut for " + which;
        }
        keyboardShortcuts [which] = callback;
    };

    $('body').on('keydown',function(ev) {
        var callback = keyboardShortcuts[ev.which];
        if (callback) {
            callback();
        }
    });

    // toolbar view
    var View = Backbone.View.extend({
        el: '#toolbar',
        render: function() {
            var context = {
                buttons: [
                        {name:'item',active:true,target:'#item'},
                        {name:'item/1',active:false,target:'#item/0001'},
                    ],
                };
            var tpl = $templates.find('#toolbar').html();
            this.$el.html(mustache.render(tpl,context));
        }
    });


    return {
        view: new View(),
        registerKeyboardShortcut : registerKeyboardShortcut,
    }

});
