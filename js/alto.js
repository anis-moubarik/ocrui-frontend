define(['underscore','jquery','libalto','mybackbone','ocruidoc','utils','events'],
        function (_,$,libalto,mybackbone,mets,utils,events,async) {
    "use strict";

    var AltoModel = mybackbone.Model.extend({
        initialize: function (options) {
            this.set('pageNumber',options.pageNumber);
            this.currentUrl = options.doc.getAltoUrl(options.pageNumber);
            this.originalUrl = options.doc.getOriginalAltoUrl(options.pageNumber);
            options.doc.registerAlto(options.pageNumber,this);
            this.id = options.id;
            this.set('pageIndex',options.pageNumber-1);
            this.alto = new libalto.Alto();
        },
        refreshAfterSave: function () {

            console.log('possibly refreshing alto ' + this.id);
            var self = this;

            if (this.isDirty()) {

                this.fetch()
                    .done ( function () {
                        events.trigger('altoRefreshed',self);
                    } );

            }

        },
        isDirty: function() {
            return this.alto.isDirty();
        },
        isDirty0: function() {
            return this.alto.isDirty0();
        },
        getWordAt: function(x,y) {
            return this.alto.getWordAt(x,y);
        },
        updateStringContent: function (content) {
            var rv = this.alto.updateStringContent(content);
            events.trigger('pageDirtyStateChanged');
            return rv;
        },
        setNthWordLanguage: function(index,language) {
            return this.alto.setNthWordLanguage(index,language);
        },
        getNthWord: function(index) {
            return this.alto.getNthWord(index);
        },
        getAsAltoXML: function() {
            return this.alto.getAsAltoXML();
        },
        getChangedSince0Sequence: function() {
            return this.alto.getChangedSince0Sequence();
        },
        getChangedSinceSaveSequence: function() {
            return this.alto.getChangedSinceSaveSequence();
        },
        getLanguageSequence: function() {
            return this.alto.getLanguageSequence();
        },
        getLayoutBoxes: function() {
            return this.alto.getLayoutBoxes();
        },
        getString: function(lineBreaks) {
            var previousTextBlock = 0;
            var previousTextLine = 0;
            var words = this.alto.getWordSequence();
            var strings = _.map(words,function (w,i) {

                var rv;
                if (previousTextBlock != w.textBlock) {
                    rv = '\n\n' + w.content;
                } else if (previousTextLine != w.textLine) {
                    rv = (lineBreaks ? '\n' : ' ') + w.content;
                } else {
                    rv = (i != 0 ? ' ' : '') + w.content;
                }

                previousTextBlock = w.textBlock;
                previousTextLine = w.textLine;

                return rv;

            });

            return strings.join('');
        },
        fetch: function (options) {

            var self = this;
            var def = new $.Deferred();

            console.log(this.currentUrl);
            console.log(this.originalUrl);

            if ((options||{}).currentOnly) {
                
                return $.get(this.currentUrl)
                    .done( handlerFactory(this.alto.setCurrentXML,'current') );

            } else {

                return $.when(
                    $.get(this.currentUrl)
                        .done( handlerFactory (
                                this.alto.setCurrentXML,'current'
                            ) ),
                    $.get(this.originalUrl)
                        .done ( handlerFactory (
                                this.alto.setOriginalXML,'original'
                            ) )
                    )
                    .done( function () {
                        console.log('alto loading done');
                    } );

            }

            function handlerFactory (method,name,url) {

                return function (data) {

                    var parsed;

                    try {
                        parsed = $.parseXML(data)
                    } catch (er) {
                        parsed = null;
                    }

                    console.log('loaded ' + name + ' alto');
                    console.log('loaded ' + name + ' alto');
                    method.apply(self.alto,[parsed]);

                    // TODO: this happens twice, but so what
                    var page = $(data).find('Page');
                    var width = parseInt(page.attr("WIDTH"),10);
                    var height = parseInt(page.attr("HEIGHT"),10);
                    events.trigger(
                        'setPageGeometry',
                        {width:width,height:height}
                        );

                }

            }

            function sorter (a,b) {
                var aN = parseInt(a.number,10);
                var bN = parseInt(b.number,10);
                return aN - bN;
            };

        },

    });

    function get(options) {

        var promise = new $.Deferred();

        mets.getCurrent().then(
            function (doc) {
                var altoOptions = {
                    docId: options.docId,
                    pageNumber: options.pageNumber,
                    id: getAltoId(options),
                    doc: doc
                };
                var alto = altos[altoOptions.id];
                if (alto === undefined) {
                    try {
                        alto = new AltoModel(altoOptions);
                    } catch (err) {
                        promise.reject(err);
                        return;
                    }
                    altos[altoOptions.id] = alto;
                    alto.loading = alto.fetch();
                }
                alto.loading.then(
                    function () {promise.resolve(alto);},
                    function (err) {promise.reject(err);}
                );
            },
            function (arg) { promise.reject(arg); }
        );
        return promise;
    }

    var altos = {};

    events.on('saved', function () {

        for (var id in altos) {

            altos[id].refreshAfterSave();

        }

    });

    function getAltoId(options) {
        return options.docId+'/'+options.pageNumber;
    }

    return {
        get : get
    };
});
