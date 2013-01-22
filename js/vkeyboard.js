define(['jquery','underscore','backbone','events'],function ($,_,Backbone,events) {
    "use strict";

    var View = Backbone.View.extend({
        initialize:function() {
            var that = this;
            events.on('languagesChanged',function(languages) {
                that.languages = languages;
                that.render();
                });

            },
        el: '#vkeyboard',
        render: function() {

            this.$el.html('');
            var $div = $('<div class="btn-group"/>');
            this.$el.append($div);

            if (this.languages === undefined) {return;}
            var chars = undefined;
            for (var i in this.languages.get('languages')) {
                var l = this.languages.get('languages')[i];
                if (l.code==this.languages.get('selected')) {
                    chars = l.keyboard;
                }
            }
            if (chars === undefined) {return;}

            _.each(chars,function(v) {
                var $a = $('<a />');
                $a.attr("href","#");
                $a.attr("class","btn");
                $a.attr("data-character",v);
                $a.text(v);
                $a.click(function(ev) {
                    var ch = ev.currentTarget.getAttribute('data-character');
                    events.trigger('virtualKeyboard',ch);
                    ev.preventDefault();
                    ev.stopPropagation();
                });
            $div.append($a);
            });
        }
    });

    return {
        view: new View()
    };
});
