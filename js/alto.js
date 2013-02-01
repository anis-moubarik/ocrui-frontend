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
        getWords: function() {

            var that = this;
            var words = $(this.currentData).find('String').map(function() {
                return that.dom2Word(this);
            }).get();
            return words;

        },
        getWordIndexAt: function(x,y) {
            var selection;

            var minDistance;
            var minDistanceIndex;
            var that=this;
            // find bounding box under or closest to the cursor.
            $(this.currentData).find('String').each(function(i) {

                var word = that.dom2Word(this);

                // look for an exact match
                if ((x >= word.hpos) && (x <= word.hpos + word.width) &&
                    (y >= word.vpos) && (y <= word.vpos + word.height)) {

                    selection = i;
                    return false;

                }

                // look for a bounding box nearby
                function tryToSetClosestCorner(cornerX,cornerY) {
                    var distance = Math.sqrt(
                        Math.pow((cornerX - x), 2) +
                        Math.pow((cornerY - y), 2)
                    );
                    if ((minDistance === undefined) || (distance < minDistance))
                    {
                        minDistance = distance;
                        minDistanceIndex = i;
                    }
                }
                tryToSetClosestCorner(word.hpos,word.vpos);
                tryToSetClosestCorner(word.hpos+word.width,word.vpos);
                tryToSetClosestCorner(word.hpos,word.vpos+word.height);
                tryToSetClosestCorner(word.hpos+word.width,word.vpos+word.height);

            });
            if (selection === undefined) {
                selection = minDistanceIndex;
            }
            return selection;
        },
        updateAlto: function (content) {

            this.alto.updateStringContent(content);

            // create new Alto based on string in content and
            // original alto structure
            if (this.originalData === undefined) {return;}
            var words = content.split(/\s+/);
            this.currentData = libalto.createAlto(
                this.originalData,
                this.currentData
                ,words );

        },

        setNthWordLanguage: function(index,language) {
            var $dom =  $(this.currentData).find('String').eq(index);
            $dom.attr('LANGUAGE',language);
            return this.dom2Word($dom.get(0));
        },
        getNthWord: function(index) {
            var dom =  $(this.currentData).find('String').get(index);
            if (dom === undefined) {return undefined;}
            return this.dom2Word(dom);
        },
        getStringSequence: function(dom) {
            if (dom === undefined) {dom = this.currentData;}
            return $(dom).find('String').map(
                function() { return this.getAttribute('CONTENT'); }
            ).get();
        },
        getChangedSequence: function(dom) {
            if (dom === undefined) {dom = this.currentData;}
            return $(dom).find('String').map(
                function() {
                    return this.getAttribute('CHANGED') ? true : false;
                }
            ).get();
        },

        getChangedSinceSaveSequence: function(dom) {
            if (dom === undefined) {dom = this.currentData;}
            return $(dom).find('String').map(
                function() {
                    return this.getAttribute('CHANGED_SINCE_SAVE') ?
                        true :
                        false;
                }
            ).get();
        },

        getLanguageSequence: function(dom) {
            if (dom === undefined) {dom = this.currentData;}
            return $(dom).find('String').map(
                function() {
                    return this.getAttribute('LANGUAGE') ? true : false;
                }
            ).get();
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
            if (page) {
                data.width = page.getAttribute("WIDTH");
                data.height = page.getAttribute("HEIGHT");
            }
            events.trigger('setPageGeometry',data);
            this.alto.setOriginalXML(response);
            this.alto.setCurrentXML(response);
            this.currentData = response;
            this.originalData = response; // BUG! figure out how this goes
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
