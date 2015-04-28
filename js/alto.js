define(['underscore','jquery','libwords','mybackbone','ocruidoc','events','wordconv'],
        function (_,$,libwords,mybackbone,mets,events,wordconv) {
    "use strict";

    var AltoModel = mybackbone.Model.extend({
        initialize: function (options) {
            this.set('pageNumber',options.pageNumber);
            this.currentUrl = options.doc.getAltoUrl(options.pageNumber);
            this.originalUrl = options.doc.getOriginalAltoUrl(options.pageNumber);
            options.doc.registerAlto(options.pageNumber,this);
            this.id = options.id;
            this.set('pageIndex',options.pageNumber-1);
            this.originalWords = [];
            this.savedWords = [];
            this.editorWords = [];
            this.changedSinceSave = false;
            this.changedSince0 = false;
        },
        refreshAfterSave: function (doc) {

            var self = this;

            if (!this.isDirty()) return;

            var p = this.get('pageNumber')
            this.currentUrl = doc.getAltoUrl(p);
            this.fetch()
                .done ( function () {
                    console.log('fetch done');
                    events.trigger('pageDirtyStateChanged');
                    events.trigger('altoRefreshed',self);
                } );

        },
        isDirty: function() {
            return this.changedSinceSave;
        },
        isDirty0: function() {
            return this.changedSince0;
        },
        getWordAt: function(x,y) {
            return libwords.getWordAt(this.editorWords,x,y);
        },
        updateStringsContent: function (strings) {

            var out = libwords.transform(
                    this.originalWords,
                    this.savedWords,
                    this.editorWords,
                    strings
            );
            this.editorWords = out.targetWords;
            this.changedSince0 = out.dirtySince0;
            this.changedSinceSave = out.dirtySinceSave;
            //console.log(out);
            events.trigger('pageDirtyStateChanged');

        },
        setNthWordLanguage: function(index,language) {
            this.editorWords[index].language = language;
            this.changedSince0 = true;
            this.changedSinceSave = true;
            return this.editorWords[index];
        },
        setNthWordTag: function(index, tag) {
            this.editorWords[index].tag = tag;
            this.changedSince0 = true;
            this.changedSinceSave = true;
            return this.editorWords[index];
        },

        getNthWord: function(index) {
            return this.editorWords[index];
        },
        getAsAltoXML: function() {

            return wordconv.words2alto(this.editorWords,this.originalXML);

        },
        getChangedSince0Sequence: function() {
            return libwords.getChangedSince0Sequence(this.editorWords);
        },
        getChangedSinceSaveSequence: function() {
            return libwords.getChangedSinceSaveSequence(this.editorWords);
        },
        getLanguageSequence: function() {
            return libwords.getLanguageSequence(this.editorWords);
        },
        getTagSequence: function() {
            return libwords.getTagSequence(this.editorWords);
        },
        getLayoutBoxes: function() {
            return this.layoutBoxes;
        },
        getString: function(lineBreaks) {
            var previousTextBlock = 0;
            var previousTextLine = 0;
            var words = libwords.getWordSequence(this.editorWords);
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

            if ((options||{}).currentOnly) {
                
                return altoLoader('current');

            } else {

                var $def1 = altoLoader( 'current' );
                var $def2 = altoLoader( 'original' );

                return $.when( $def1, $def2 );

            }

            function altoLoader (version) {

                var url = (version == 'current') ?
                          self.currentUrl :
                          self.originalUrl;
                return $.get(url).done( function (data) {

                    var parsed = null;

                    try {
                        parsed = $.parseXML(data);
                    } catch (er) { }

                    if (version == 'current') {

                        self.currentXML = parsed;
                        self.savedWords = wordconv.alto2words(parsed);
                        self.editorWords = self.savedWords;
                        self.layoutBoxes = self.constructLayoutBoxes(
                            self.savedWords );

                    } else {

                        self.originalXML = parsed;
                        self.originalWords = wordconv.alto2words(parsed);

                    }

                    if (self.originalXML && self.currentXML) {

                        var strings = _.map(self.savedWords, getContent)
                        self.updateStringsContent(strings);
                        var page = $(data).find('Page');
                        var printSpace = $(data).find('PrintSpace');
                        var width = parseInt(page.attr("WIDTH"),10)
                                ||  parseInt(printSpace.attr("WIDTH"),10);
                        var height = parseInt(page.attr("HEIGHT"),10)
                                ||  parseInt(printSpace.attr("HEIGHT"),10);
                        events.trigger(
                            'setPageGeometry',
                            {width:width,height:height}
                            );

                    }

                });

            }

            function getContent(w) { return w.content; }

            function sorter (a,b) {
                var aN = parseInt(a.number,10);
                var bN = parseInt(b.number,10);
                return aN - bN;
            };

        },

        constructLayoutBoxes : function(words) {
            var layoutBoxes = Math.max.apply(null,
                _.map(words, function (w) { return w.textBlock; })
            );

            var boxes = [];
            for (var i = 0; i <= layoutBoxes; i++ ) {
                var myWords = _.filter(words,
                    function (w) {return w.textBlock == i;}
                );

                var layoutBox = libwords.getCombinedBoundingBox(myWords);
                layoutBox.index = i;
                layoutBox.fromIndex = Math.min.apply(null,
                    _.map(myWords, function(w) { return w.index; })
                );
                layoutBox.toIndex = Math.max.apply(null,
                    _.map(myWords, function(w) { return w.index; })
                );
                boxes.push(layoutBox);
            }
            return boxes;
        }

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

    events.on('documentSaved', function (doc) {

        for (var id in altos) {

            altos[id].refreshAfterSave(doc);

        }

    });

    function getAltoId(options) {
        return options.docId+'/'+options.pageNumber;
    }

    return {
        get : get
    };
});
