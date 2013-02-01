/*globals $templates:false*/

define(['jquery','underscore','events','mustache','backbone'],function ($,_,events,mustache,Backbone) {
    "use strict";

    var model;

    function load(callback) {
        if (model === undefined) {
            model = new Model();
            model.fetch({success:callback});
        } else {
            callback(model);
        }
    }

    var Model = Backbone.Model.extend({
        url: function () { return '/ocrui/languages.json';}
    });

    var View = Backbone.View.extend({
        initialize:function() {
            var that = this;
            events.on('appReady',function() {
                that.render();
            });
            events.on('languageChanged',function(languages) {
                that.languages = languages;
                that.render();
            });
            events.on('changeCoordinates',function(data) {
                that.changeCoordinates(data);
            });

        },
        el: '#vkeyboard',
        events: {
            'click ul a': 'changeLanguage'
        },
        changeCoordinates: function (words) {
            if (words === undefined) return; // do something else
            var newLanguage = words.reduce( function (prev,cur) {
                var l = cur.language;
                if (prev == null) return l;
                if (prev != l) return undefined;
                return l;
            }, null);
            if (model) {
                model.set('selected', newLanguage);
            }

            this.render();
        },
        changeLanguage: function (ev) {
            var l = ev.currentTarget.getAttribute("data-value");
            ev.preventDefault();
            ev.stopPropagation();
            model.set('selected',l);
            events.trigger('languageChanged',model);
            events.trigger('requestLanguageChange',model.get('selected'));
            this.render();
        },
        render: function() {

                console.log('render!');
            this.$el.html('');
            var $li = $('<li></li>');
            var $li2 = $('<li></li>');
            var $div = $('<div id="language-selector" class="btn-group">');
            $li.append($div);
            this.$el.append($li);

            var $div2 = $('<div id="keyboard" class="btn-group"/>');
            $li2.append($div2);
            this.$el.append($li2);

            if (this.languages === undefined) {return;}
            var chars;
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
            $div2.append($a);
            });

                var $a = $('<a />');
                $a.attr("href","#");
                $a.attr("class","btn");
                $a.attr("data-character","koe");
                $a.text("koe");
                $a.click(function(ev) {
                    var ch = ev.currentTarget.getAttribute('data-character');
                    events.trigger('virtualKeyboard',ch);
                    ev.preventDefault();
                    ev.stopPropagation();
                });
            $div2.append($a);

            load(function(languages) {
                events.trigger('languageChanged',languages);
                var context = {
                    selected: languages.get('selected'),
                    selectedName: languages.get('selected')
                };
                context.languages = languages.get('languages').map(function(e) {
                    if(e.code==languages.get('selected')) {
                        context.selectedName = e.name;
                        return undefined;
                    } else {
                        return e;
                    }
                }).filter(function(e) { return e!==undefined; });
                var tpl = $templates.find('#language-selector-template').html();
                $div.html(mustache.render(tpl,context));
                $div.removeClass('open');
                console.log('r');
            });
            console.log('r1');

        }

    });

    return {
        view: new View()
    };
});
