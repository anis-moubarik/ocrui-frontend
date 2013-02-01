define(['jquery','libalto','backbone','mybackbone','mets','utils','events'],
        function ($,libalto,Backbone,mybackbone,mets,utils,events) {
    "use strict";

    var AltoModel = Backbone.Model.extend({
        initialize: function (options) {
            this.url = options.doc.getAltoUrl(options.pageNumber);
            options.doc.registerAlto(options.pageNumber,this);
            this.alto = new libalto.Alto()
        },
        dom2Word: function(dom) {
            return this.alto.dom2Word(dom);
        },
        isDirty: function() {
            return this.alto.isDirty();
        },
        getWordIndexAt: function(x,y) {
            return this.alto.getWordIndexAt(x,y);
        },
        updateStringContent: function (content) {
            return this.alto.updateStringContent(content);
        },
        setNthWordLanguage: function(index,language) {
            return this.alto.setNthWordLanguage(index,language);
        },
        getNthWord: function(index) {
            return this.alto.getNthWord(index);
        },
        getStringSequence: function(dom) {
            return this.alto.getStringSequence(dom);
        },
        getChangedSequence: function(dom) {
            return this.alto.getChangedSequence(dom);
        },
        getChangedSinceSaveSequence: function(dom) {
            return this.alto.getChangedSinceSaveSequence(dom);
        },
        getLanguageSequence: function(dom) {
            return this.alto.getLanguageSequence(dom);
        },
        getLayoutBoxes: function() {
            return this.alto.getLayoutBoxes();
        },
        getString: function(dom) {
            return this.getStringSequence(dom).join(' ');
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

        sync: mybackbone.sync
    });

    var altos = {};

    function getAltoId(options) {
        return options.docId+'/'+options.pageNumber;
    }

    function get(options) {

        var promise = new $.Deferred();

        mets.get(options).then(
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
