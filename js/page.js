/*global console:false */
define(['underscore','jquery','events','toolbar','mustache','mybackbone','templates'],
        function (_,$,events,toolbar,mustache,mybackbone,templates) {
    "use strict";

    var facsimileRendered;
    var editorRendered;

    events.on('facsimileRendered', function (d) { facsimileRendered.resolve(d); });

    events.on('facsimileRenderError', function (d) { facsimileRendered.reject(d); });

    events.on('editorRendered', function (d) { editorRendered.resolve(d); });

    events.on('editorRenderError', function (d) { editorRendered.reject(d); });

    events.on('changePage', function (data) {

        /* create new deferreds. clear earlier ones before.
         */
        /* clear earlier deferred callbacks before starting */
        if (facsimileRendered !== undefined) {
            facsimileRendered.resolve();
        }
        facsimileRendered = new $.Deferred();

        if (editorRendered !== undefined) {
            editorRendered.resolve();
        }
        editorRendered = new $.Deferred();

        events.trigger('nowProcessing',"page-change");

        $.when(facsimileRendered,editorRendered).then(
            function() {
                events.trigger('changePageDone',data);
                events.trigger('endProcessing',"page-change");
            },
            function(data) {
                events.trigger('changePageError',{
                    error:'changePageError',
                    message: data
                });
                events.trigger('endProcessing',"page-change");
            });
    });




    var View = mybackbone.View.extend({
        initialize: function() {
            this.options = {};
            var that = this;

            toolbar.registerKeyboardShortcut(33, function() {
                that.pagePrevious();
            });
            toolbar.registerKeyboardShortcut(34, function() {
                that.pageNext();
            });

            toolbar.registerButton({
                id:"save",
                toggle:false,
                text:"Save",
                title:"Save",
                modes:["page"],
                click: function () {
                    var dirtyPages = that.mets.dirtyPages();
                    var pNums = _.map(dirtyPages,function (p) {
                        return p.get('pageNumber');
                    });
                    var dString = pNums.join(' ');
                    console.log('dirty pages:', dString);
                    console.log('should now PUT');
                }
            });

            toolbar.registerWidget({
                id:'page-selector',
                view:this,
                index: 1,
                classes: "btn-group form-horizontal input-prepend input-append pull-right",
                modes:['page'] });

        },
        el : '#page-selector',
        myEvents: {
            /*
            'requestNextPage' : 'pageNext',
            'requestPrevPage' : 'pagePrevious',
            */
            'changePage' : 'changePage',
            'changePageMets' : 'changePageMets',
            'documentDirtyStateChanged' : 'documentDirtyStateChanged'
        },
        events: {
            'click #page-next': 'pageNext',
            'click #page-previous': 'pagePrevious',
            'change #page-number': 'pageNumber'
        },
        documentDirtyStateChanged: function(dirty) {
            if (dirty) {
                $('#save').addClass('btn-warning');
            } else {
                $('#save').removeClass('btn-warning');
            }
        },
        changePage: function(data) {
            this.options.pageNumber = data.pageNumber;
            this.render();
        },
        changePageMets: function(mets) {
            var pages = mets.getNumberOfPages();
            this.mets = mets;
            this.setPageNumberBounds(1,pages);
            this.render();
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
        boundedSetPage : function(number) {
            if (number < this.options.minPage) number = this.options.minPage;
            if (number > this.options.maxPage) number = this.options.maxPage;
            events.delay('changePage',{pageNumber:number},100);
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
            var tpl = templates.get('page-selector');
            this.$el.html(mustache.render(tpl,context));
        }
    });

    var view = new View();

    return { }; // no external interface, this just registers a widget

});

