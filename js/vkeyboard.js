define(['backbone'],function () {

    var View = Backbone.View.extend({
        el: '#vkeyboard',
        render: function() {

            var chars = ['a','b','c','d','e','f','g','h','i',
                'j','k','l','m','n','o','p','q','r','s','t',
                'u','v','w','x','y','z'];
            var $div = $('<div class="btn-group"/>');
            this.$el.html();
            this.$el.append($div);
            _.each(chars,function(v) {
                var $a = $('<a />');
                $a.attr("href","#");
                $a.attr("class","btn");
                $a.text(v);
                $div.append($a);
            });
        }
    });

    return {
        view: new(View)
    }
});
