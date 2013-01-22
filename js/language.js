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
        url: function () { return '/ocrui/languages.json';},
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
                var string = data.CONTENT;
                console.log('setting language selector for word ' + string);
            });
        },
        el : '#language-selector',
        events: {
            //'click #page-next': 'pageNext',
            //'click #page-previous': 'pagePrevious',
            //'change #page-number': 'pageNumber',
        },
        render: function() {
            var that = this;
            load(function(languages) {
                events.trigger('languagesChanged',languages);
                var context = {
                    selected: 'Mordva',
                    languages: _.map(
                            languages.get('languages'),
                            function(e) {return e.name;})
                };
                var tpl = $templates.find('#language-selector-template').html();
                that.$el.html(mustache.render(tpl,context));
            });
        }
    });

    var view = new View();

    return {};
});

