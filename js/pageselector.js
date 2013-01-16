define(['toolbar','mustache','backbone'],function (toolbar,mustache) {

    var View = Backbone.View.extend({
        initialize: function() {
            this.options = {};
        },
        el : '#page-selector',
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
        hide: function() {
            this.$el.html("");
        },
        render: function() {
            var context = {
                pageNumber: this.options.pageNumber,
                pages: this.options.maxPage
            };
            var tpl = $templates.find('#page-selector-template').html();
            this.$el.html(mustache.render(tpl,context));
        }
    });

    toolbar.registerKeyboardShortcut(33, function() {
        view.pagePrevious();
    });
    toolbar.registerKeyboardShortcut(34, function() {
        view.pageNext();
    });

    return {
        view: undefined,
        View: View,
    }

});

