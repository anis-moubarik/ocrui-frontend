/* This is equivalent to mets files, but uses the custom ocrui backend api */

define(['jquery','mybackbone','events','conf'],function (
        $,mybackbone,events,conf) {
    "use strict";

    var DocumentModel = mybackbone.Model.extend({
        initialize: function (options) {
            this.id = options.id;
            this.urlBase = conf.urls.docBase.replace('<id>',this.id);
            this.url = this.urlBase;
            this.pages = [];
        },
        dataType: 'json',
        dirtyPages: function() {
            var dirtyPages = [];
            for (var i in this.pages) {
                var pageNumber = i + 1;
                var page = this.pages[i];
                if (page === undefined) { continue; }
                var alto = page.alto;
                if (alto === undefined) { continue; }
                if (alto.isDirty()) { dirtyPages.push(alto); }
            }
            return dirtyPages;
        },
        registerAlto: function(pageNumber,alto) {
            var myPage = this.pages[pageNumber - 1];
            if (myPage) {
                myPage.alto = alto;
            } else {
                throw 'Pagenumber ' + pageNumber + ' does not exist';
            }
        },
        isDirty: function() {
            return this.dirtyPages().length > 0;
        },
        getNumberOfPages : function () {
            return this.pages.length;
        },
        getImageThumbnailUrl : function (pageNumber) {
            var page = this.pages[pageNumber - 1]; //pageNumber is 1-based
            if (page === undefined) return undefined;
            return page.urls.thumb;
        },
        getImageUrl : function (pageNumber) {
            var page = this.pages[pageNumber - 1]; //pageNumber is 1-based
            if (page === undefined) return undefined;
            return page.urls.image;
        },
        getAltoUrl : function (pageNumber) {
            var page = this.pages[pageNumber - 1]; //pageNumber is 1-based
            if (page === undefined) return undefined;
            return page.urls.text;
        },
        parse: function (response) {
            console.log('got response');
            this.data = response;
            this.pages = this.data.Revision.pages.sort( function (a,b) {
                var aN = parseInt(a.number,10);
                var bN = parseInt(b.number,10);
                return aN < bN;
            });
            return {};
        },
        saveDirtyPages : function () { 

            var dirtyPages = this.dirtyPages();

            var data = _.map(dirtyPages,function (p) {

                // BUG: pageNumber should be what comes out from ocruidoc i
                // guess
                var i = p.get('pageNumber');

                var xml = p.getAsAltoXML();
                var xmlString = (new XMLSerializer()).serializeToString(xml);
                
                return 'Content-Type:text/xml\n' +
                       'Content-Disposition: attachment; filename='+ i + '\n' +
                       '\n' + xmlString+'\n--frontier';

            });

            var options = {

                data : '--frontier\n' + data,
                type:'POST',
                url: this.urlBase,
                contentType: 'multipart/mixed; boundary=frontier',
                processData: false
            }
            console.log('Now PUTing');
            $.ajax(options)
                .done(function(x) {
                    console.log('success',x);
                })
                .fail(function(x) {
                    console.log('error',x);
                });

        }

    });


    var currentDocId;

    var documents = {};

    function get(docId) {

        var promise = new $.Deferred();

        var doc = documents[docId];

        if (doc === undefined) {

            try {
                doc = new DocumentModel({id:docId});
            } catch (err) {
                promise.reject(err);
                return;
            }
            documents[docId] = doc;
            doc.loading = doc.fetch();

        }

        doc.loading.then(
            function () {promise.resolve(doc);},
            function (err) {
                promise.reject("Cannot load document.");console.log(err);
            }
        );

        return promise;
    }

    events.on('pageDirtyStateChanged', function (data) {
        getCurrent().done(function (mets) {
            events.trigger('documentDirtyStateChanged',mets.isDirty());
        });
    });
    events.on('changeDocument', function (data) {
        currentDocId = data.docId;
        get(data.docId).then(
            function(doc) {
                events.trigger('changeMets',doc);
                if (data.pageNumber !== undefined) {
                    events.trigger('changePage',data);
                }
            },
            function(msg) {
                events.trigger('changeMetsError',{
                    error: 'changeMetsError',
                    message: msg
            });
        });
    });

    
    function getCurrent() {
        return get(currentDocId);
    }

    function getCurrentDocId() {
        return currentDocId;
    }

    return {
        get: get,
        getCurrent: getCurrent,
        getCurrentDocId: getCurrentDocId
    };

});

