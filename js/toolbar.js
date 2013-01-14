define(['mustache','backbone'],function (mustache) {

    var View = Backbone.View.extend({
        el: '#toolbar',
        render: function(options) {
            context = {
                buttons: [
                        {name:'home',active:false,target:'#'},
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
    }

});
