/*globals require:false $templates:false */
define(['jquery','events','toolbar','mustache','backbone'],
        function ($,events,toolbar,mustache,Backbone) {
    "use strict";

    var View = Backbone.View.extend({
        initialize: function() {
            this.options = {};
            var that = this;
            this.pageChangeQueue = [];
            this.pageChangeRequested = false;

            toolbar.registerKeyboardShortcut(33, function() {
                that.pagePrevious();
            });
            toolbar.registerKeyboardShortcut(34, function() {
                that.pageNext();
            });

            toolbar.registerWidget({
                id:'page-selector',
                view:this,
                classes: "btn-group form-horizontal input-prepend input-append",
                modes:['page'] });

            events.on('changePage',function(data) {
                that.options.pageNumber = data;
                that.render();
            });
            events.on('changePageMets',function(doc) {
                var pages = doc.getNumberOfPages();
                that.setPageNumberBounds(1,pages);
                that.render();
            });
        },
        el : '#page-selector',
        events: {
            'click #page-next': 'pageNext',
            'click #page-previous': 'pagePrevious',
            'change #page-number': 'pageNumber'
        },
        pageNext : function (ev) {
            $('#page-number').attr('value',this.getPageNumber() + 1);
            this.pageNumber();
        },
        pagePrevious : function (ev) {
            $('#page-number').attr('value',this.getPageNumber() - 1);
            this.pageNumber();
        },
        pageNumber : function (ev) {
            this.boundedSetPage(this.getPageNumber());
        },
        getPageNumber : function () {
            var s = $('#page-number').attr('value');
            var i = parseInt(s,10);
            if (isNaN(i)) return 1;
            return i;
        },
        setPageNumber : function (number) {
                // queues page changes

                var that = this;
                this.pageChangeQueue.push(number);
                if (this.pageChangeRequested) return;
                this.pageChangeRequested = true;
                setTimeout(function() {that.processPageChange();},100);
        },
        processPageChange: function () {
            // TODO: this don't work properly yet.
            var number = this.pageChangeQueue[this.pageChangeQueue.length-1];
            this.pageChangeRequested = false;
            this.pageChangeQueue = [];
            events.trigger('requestChangePage',number);
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
        render: function() {
            var context = {
                pageNumber: this.options.pageNumber,
                pages: this.options.maxPage
            };
            var tpl = $templates.find('#page-selector-template').html();
            this.$el.html(mustache.render(tpl,context));
        }
    });

    var view = new View();

    return { }; // no external interface, this just registers a widget

});

