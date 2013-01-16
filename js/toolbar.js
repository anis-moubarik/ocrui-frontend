define(['mustache','backbone'],function (mustache) {

    var View = Backbone.View.extend({
        initialize: function() {
            this.options = {};
        },
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
        getPageNumber : function () {
            var s = $('#page-number').attr('value');
            var i = parseInt(s);
            if (isNaN(i)) return 1;
            return i
        },
        setPageNumber : function (number) {
                require('router').gotoPage(number);
        },
        boundedSetPage : function(number) {
            if (number < this.options.minPage) number = this.options.minPage;
            if (number > this.options.maxPage) number = this.options.maxPage;
            this.setPageNumber(number);
        },
        setPageNumberBounds : function (min,max) {
            this.options.minPage = min;
            this.options.maxPage = max;
            var pageNumber = this.getPageNumber();
            if ((pageNumber < this.options.minPage) ||
                (pageNumber > this.options.maxPage)) {
                this.boundedSetPage(pageNumber);
            }
        },
        setOptions : function(options) {
            this.options = options;
        },
        render: function(options) {
            var context = {

                displayPageSelector: this.options.displayPageSelector,
                pageNumber: this.options.pageNumber,
                buttons: [
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
