define(['toolbar','events','mustache','backbone'],function (toolbar,events,mustache) {

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
            var context = {
                selected: 'Mordva',
                languages: [
                    'Suomi',
                    'Mordva',
                    'Vepsä',
                    'Venäjä',
                ]
            };
            var tpl = $templates.find('#language-selector-template').html();
            this.$el.html(mustache.render(tpl,context));
        }
    });

    var view = new View();

    return {}
});
