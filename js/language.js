define(['underscore','jquery','events','templates','mustache','mybackbone','conf'],
        function (_,$,events,templates,mustache,mybackbone,conf) {
    "use strict";

    var _langselection = {};

    var View = mybackbone.View.extend({
        initialize:function() {
        },
        el: '#vkeyboard',
        events: {
            'change select': 'changeLanguage',
            'click a': 'vkeyboardClick'
        },
        myEvents: {
            'appReady': 'render',
            'changeCoordinates':'changeCoordinates'
        },
        vkeyboardClick: function(ev) {
            var ch = ev.currentTarget.getAttribute('data-character');
            events.trigger('virtualKeyboard',ch);
            ev.preventDefault();
            ev.stopPropagation();
        },
        changeCoordinates: function (words) {
            if (words === undefined) return; // do something else
            var newLanguage = _.reduce(words, function (prev,cur) {
                var l = (cur||{}).language;
                if (prev === null) return l;
                if (prev != l) return undefined;
                return l;
            }, null);
            if (conf.languages) {
                conf.selected_language = newLanguage;
            }

            this.render();
        },
        changeLanguage: function (ev) {
            var l = $(ev.target).find(':selected').attr('value');
            ev.preventDefault();
            ev.stopPropagation();
            conf.selected_language=l;
            events.trigger('requestLanguageChange',l);
            events.trigger("saveDocument");
            this.render();

        },
        render: function() {

            var that = this;

            var context = {
                xselected: conf.selected_language,
                selectedName: conf.selected_language,
                chars: []
            };
            console.log(context);
            var isAnySelected = false;
            context.languages = _.map(conf.languages, function(e) {
                    var o = {
                        code: e.code,
                        name: e.name,
                        selected: ' '
                    };
                    if (e.code==conf.selected_language) {
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
            for (var i in conf.languages) {
                var l = conf.languages[i];
                if (l.code==conf.selected_language) {
                    context.chars = l.keyboard;
                }
            }

            var tpl = templates.get('language-selector');

            this.$el.html(mustache.render(tpl,context));
            events.trigger('keyboardLayoutChanged');

            var textarea = $('.CodeMirror');

            var SAR = {};

            SAR.find = function(){
                var txt = textarea.val();
                var strSearchTerm = "tyhjä";

                txt = txt.toLowerCase();
                strSearchTerm = strSearchTerm.toLowerCase();

                var cursorPos = textarea.getCursorPosEnd();
                var termPos = txt.indexOf(strSearchTerm, cursorPos);

                if(termPos != -1){
                    textarea.selectRange(termPos, termPos+strSearchTerm.length);
                }else{
                    termPos = txt.indexOf(strSearchTerm);
                    if(termPos != -1){
                        textarea.selectRange(termPos, termPos+strSearchTerm.length)
                    }else{
                        console.log("not found");
                    }
                }
            }

        }

    });

    return {
        view: new View()
    };
});
