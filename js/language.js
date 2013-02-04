/*globals $templates:false*/

define(['jquery','underscore','events','mustache','backbone'],function ($,_,events,mustache,Backbone) {
    "use strict";

    var Model = Backbone.Model.extend({
        url: function () { return '/ocrui/languages.json';}
    });

    var View = Backbone.View.extend({
        initialize:function() {
            var that = this;
            events.on('appReady',function() { that.load(); });
            events.on('changeCoordinates',function(data) {
                that.changeCoordinates(data);
            });

        },
        el: '#vkeyboard',
        events: {
            'change select': 'changeLanguage',
            'click a': 'vkeyboardClick'
        },
        vkeyboardClick: function(ev) {
            var ch = ev.currentTarget.getAttribute('data-character');
            console.log(ch);
            events.trigger('virtualKeyboard',ch);
            ev.preventDefault();
            ev.stopPropagation();
        },
        load: function() {
            var that = this;
            this.languages = new Model();
            this.languages.fetch({
                success: function() {that.render(); }
            });
        },
        changeCoordinates: function (words) {
            if (words === undefined) return; // do something else
            var newLanguage = words.reduce( function (prev,cur) {
                var l = cur.language;
                if (prev == null) return l;
                if (prev != l) return undefined;
                return l;
            }, null);
            if (this.languages) {
                this.languages.set('selected', newLanguage);
            }

            this.render();
        },
        changeLanguage: function (ev) {
            var l = $(ev.target).find(':selected').attr('data-value');
            ev.preventDefault();
            ev.stopPropagation();
            this.languages.set('selected',l);
            events.trigger('requestLanguageChange',l);
            this.render();
        },
        render: function() {

            var that = this;

            var context = {
                selected: this.languages.get('selected'),
                selectedName: this.languages.get('selected'),
                chars: []
            };
            var isAnySelected = false;
            context.languages = this.languages.get('languages').
                map(function(e) {
                    var o = {
                        code: e.code,
                        name: e.name,
                        selected: undefined
                        }
                    if (e.code==that.languages.get('selected')) {
                        context.selectedName = e.name;
                        o.selected = "selected";
                        isAnySelected = true;
                    }
                    return o;
                });
            context.languages.push({
                code: '',
                name: '',
                selected: isAnySelected ? undefined : 'selected'
                });

            for (var i in this.languages.get('languages')) {
                var l = this.languages.get('languages')[i];
                if (l.code==this.languages.get('selected')) {
                    context.chars = l.keyboard;
                }
            }

            var tpl = $templates.find('#language-selector-template').html();
            this.$el.html(mustache.render(tpl,context));

        }

    });

    return {
        view: new View()
    };
});
