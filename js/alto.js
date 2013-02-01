define(['jquery','libalto','backbone','mybackbone','mets','utils'],
        function ($,libalto,Backbone,mybackbone,mets,utils) {
    "use strict";

    var AltoModel = Backbone.Model.extend({
        initialize: function (options) {
            this.dirty = false;
            this.url = options.doc.getAltoUrl(options.pageNumber);
            options.doc.registerAlto(options.pageNumber,this);
        },
        dom2Word: function(dom) {
            // see also setNthWord
            return {
                content: dom.getAttribute('CONTENT'),
                language: dom.getAttribute('LANGUAGE'),
                hpos: parseInt(dom.getAttribute('HPOS'),10)/this.get('width'),
                vpos: parseInt(dom.getAttribute('VPOS'),10)/this.get('height'),
                width: parseInt(dom.getAttribute('WIDTH'),10)/this.get('width'),
                height: parseInt(dom.getAttribute('HEIGHT'),10)/this.get('height')
            };
        },
        isDirty: function() {
            return this.dirty;
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

            // create new Alto based on string in content and
            // original alto structure
            if (this.originalData === undefined) {return;}
            if (words) {return;}
            var words = content.split(/\s+/);
            this.currentData = libalto.createAlto(
                this.originalData,
                this.currentData
                ,words );
            this.dirty = true;

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

        getString: function(dom) {
            return this.getStringSequence(dom).join(' ');
        },

        getLayoutBoxes: function () {

            var that = this;
            var tb = $(this.currentData).find('TextBlock').map(function () {
                var $strings = $(this).find('String');
                var words = $strings.map(function() {
                    return that.dom2Word(this);
                }).get();
                var combined = utils.getCombinedBoundingBox(words);
                return combined;
            });
            return tb;
        },

        parse: function (response) {
            var data = {};
            this.currentData = response;
            this.originalData = response; // BUG! figure out how this goes
            var page = $(response).find('Page').get(0);
            if (page) {
                data.width = page.getAttribute("WIDTH");
                data.height = page.getAttribute("HEIGHT");
            }
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
