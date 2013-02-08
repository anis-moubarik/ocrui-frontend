define(['underscore','jquery','events','templates','mustache','mybackbone','languages'],
        function (_,$,events,templates,mustache,mybackbone,languages) {
    "use strict";

    var View = mybackbone.View.extend({
        initialize:function() {

        },
        el: '#vkeyboard',
        events: {
            'change select': 'changeLanguage',
            'click a': 'vkeyboardClick'
        },
        myEvents: {
            'appReady': 'load',
            'changeCoordinates':'changeCoordinates'
        },
        vkeyboardClick: function(ev) {
            var ch = ev.currentTarget.getAttribute('data-character');
            events.trigger('virtualKeyboard',ch);
            ev.preventDefault();
            ev.stopPropagation();
        },
        load: function() {
            var that = this;
            this.languages = languages;
            this.render();
        },
        changeCoordinates: function (words) {
            if (words === undefined) return; // do something else
            var newLanguage = _.reduce(words, function (prev,cur) {
                var l = cur.language;
                if (prev === null) return l;
                if (prev != l) return undefined;
                return l;
            }, null);
            if (this.languages) {
                this.languages.selected= newLanguage;
            }

            this.render();
        },
        changeLanguage: function (ev) {
            var l = $(ev.target).find(':selected').attr('value');
            ev.preventDefault();
            ev.stopPropagation();
            this.languages.selected=l;
            events.trigger('requestLanguageChange',l);
            this.render();

        },
        render: function() {

            var that = this;

            var context = {
                xselected: this.languages.selected,
                selectedName: this.languages.selected,
                chars: []
            };
            var isAnySelected = false;
            context.languages = _.map(this.languages.languages, function(e) {
                    var o = {
                        code: e.code,
                        name: e.name,
                        selected: ' '
                    };
                    if (e.code==that.languages.selected) {
                        context.selectedName = e.name;
                        o.selected = "selected";
                        isAnySelected = true;
                    }
                    return o;
                });
            context.languages.push({
                code: '',
                name: '',
                selected: isAnySelected ? ' ' : 'selected'
                });

            for (var i in this.languages.languages) {
                var l = this.languages.languages[i];
                if (l.code==this.languages.selected) {
                    context.chars = l.keyboard;
                }
            }

            var tpl = templates.get('language-selector');

            this.$el.html(mustache.render(tpl,context));
            events.trigger('keyboardLayoutChanged');

        }

    });

    return {
        view: new View()
    };
});
