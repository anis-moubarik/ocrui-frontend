define(['underscore','jquery','libalto','mybackbone','ocruidoc','utils','events'],
        function (_,$,libalto,mybackbone,mets,utils,events) {
    "use strict";

    var AltoModel = mybackbone.Model.extend({
        initialize: function (options) {
            this.set('pageNumber',options.pageNumber);
            this.url = options.doc.getAltoUrl(options.pageNumber);
            options.doc.registerAlto(options.pageNumber,this);
            this.set('pageIndex',options.pageNumber-1);
            this.alto = new libalto.Alto();
        },
        isDirty: function() {
            return this.alto.isDirty();
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
        getChangedSequence: function() {
            return this.alto.getChangedSequence();
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
        parse: function (response) {
            var data = {};
            var page = $(response).find('Page').get(0);
            if (!page) return {};
            data.width = parseInt(page.getAttribute("WIDTH"),10);
            data.height = parseInt(page.getAttribute("HEIGHT"),10);
            data.pageIndex = this.get('pageIndex');
            events.trigger('setPageGeometry',data);
            this.alto.setOriginalXML(response);
            this.alto.setCurrentXML(response);
            return data;
        }
    });

    function get(options) {

        var promise = new $.Deferred();

        mets.getCurrent().then(
            function (doc) {
                var altoOptions = {
                    docId: options.docId,
                    pageNumber: options.pageNumber,
                    versionNumber: options.versionNumber,
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

    function getAltoId(options) {
        return options.docId+'/'+options.pageNumber;
    }

    return {
        get : get
    };
});
