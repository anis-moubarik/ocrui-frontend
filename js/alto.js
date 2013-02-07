define(['jquery','libalto','mybackbone','mets','utils','events'],
        function ($,libalto,mybackbone,mets,utils,events) {
    "use strict";

    var AltoModel = mybackbone.Model.extend({
        initialize: function (options) {
            this.set('pageNumber',options.pageNumber);
            this.url = options.doc.getAltoUrl(options.pageNumber);
            options.doc.registerAlto(options.pageNumber,this);
            this.alto = new libalto.Alto()
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
        getStringSequence: function() {
            return this.alto.getStringSequence();
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
        getString: function() {
            var s = ""
            var layoutBoxes = this.getLayoutBoxes();
            var strings = this.getStringSequence();
            layoutBoxes.map(function (l,i) {
                for (var i = l.fromIndex; i < l.toIndex; i++) {
                    if (i > l.fromIndex) s += " ";
                    s += strings[i];
                }
                s += "\n";
            });
            return s;
        },
        parse: function (response) {
            var data = {};
            var page = $(response).find('Page').get(0);
            data.width = page.getAttribute("WIDTH");
            data.height = page.getAttribute("HEIGHT");
            events.trigger('setPageGeometry',data);
            this.alto.setOriginalXML(response);
            this.alto.setCurrentXML(response);
            return data;
        },
    });

    var altos = {};

    function getAltoId(options) {
        return options.docId+'/'+options.pageNumber;
    }

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
                    function () {promise.reject("Cannot load alto file");}
                );
            },
            function (arg) { promise.reject(arg); }
        );
        return promise;
    }

    return {
        get: get
    };
});
