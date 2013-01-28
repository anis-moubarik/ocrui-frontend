/*globals console:true, $templates:false*/
define(['toolbar','events','mustache','backbone','vkeyboard'],function (toolbar,events,mustache,Backbone,vkeyboard) {
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
        initialize: function() {
            var that = this;

            toolbar.registerWidget({
                id:'language-selector',
                view:this,
                classes:'btn-group',
                modes:['page']});

            events.on('changeCoordinates',function(data) {
                that.changeCoordinates(data);
            });
        },
        el : '#language-selector',
        events: {
            'click ul a': 'changeLanguage'
        },
        changeCoordinates: function (word) {
            if (word === undefined) return; // do something else
            var l = word.language;
            model.set('selected', l);

            this.render();
            //console.log('setting language selector for word ' + string);
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
            var that = this;
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
                that.$el.html(mustache.render(tpl,context));
                that.$el.removeClass('open');
            });
        }
    });

    var view = new View();

    return {};
});

