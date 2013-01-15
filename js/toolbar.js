define(['mustache','backbone'],function (mustache) {

    var View = Backbone.View.extend({
        el: '#toolbar',
        events: {
            'click #page-next': 'pageNext',
            'click #page-previous': 'pagePrevious',
            'change #page-number': 'pageNumber',
        },
        pageNext : function (ev) {
            this.boundedSetPage(this.getPageNumber() + 1);
        },
        pagePrevious : function (ev) {
            this.boundedSetPage(this.getPageNumber() - 1);
        },
        pageNumber : function (ev) {
            this.boundedSetPage(this.getPageNumber());
        },
        getPageNumber : function (number) {
            var s = $('#page-number').attr('value');
            var i = parseInt(s);
            if (isNaN(i)) return 0;
            return i
        },
        setPageNumber : function (number) {
            $('#page-number').attr('value',number);
        },
        boundedSetPage : function(number) {
            if (number < this.min) number = this.min;
            if (number > this.max) number = this.max;
            this.setPageNumber(number);
        },
        setPageNumberBounds : function (min,max) {
            this.min = min;
            this.max = max;
        },
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
