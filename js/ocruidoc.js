/* This is equivalent to mets files, but uses the custom ocrui backend api */

define(['jquery','mybackbone','events','conf','base64'],function (
        $,mybackbone,events,conf,base64) {
    "use strict";

    var DocumentModel = mybackbone.Model.extend({
        initialize: function (options) {
            this.id = options.id;
            this.urlBase = conf.urls.docBase.replace('<id>',this.id);
            this.currentPages = [];
            this.originalPages = [];
        },
        dataType: 'json',
        dirtyPages: function() {
            var dirtyPages = [];
            for (var i in this.currentPages) {
                var pageNumber = i + 1;
                var page = this.currentPages[i];
                if (page === undefined) { continue; }
                var alto = page.alto;
                if (alto === undefined) { continue; }
                if (alto.isDirty()) { dirtyPages.push(alto); }
            }
            return dirtyPages;
        },
        registerAlto: function(pageNumber,alto) {
            var myPage = this.currentPages[pageNumber - 1];
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
            return this.currentPages.length;
        },
        getImageThumbnailUrl : function (pageNumber) {
            var page = this.currentPages[pageNumber - 1]; // 1-based
            if (page === undefined) return undefined;
            return page.urls.thumb;
        },
        getImageUrl : function (pageNumber) {
            var page = this.currentPages[pageNumber - 1]; // 1-based
            if (page === undefined) return undefined;
            return page.urls.image;
        },
        getOriginalAltoUrl : function (pageNumber) {
            var page = this.originalPages[pageNumber - 1]; // 1-based
            if (page === undefined) return undefined;
            return page.urls.text;
        },
        getAltoUrl : function (pageNumber) {
            var page = this.currentPages[pageNumber - 1]; // 1-based
            if (page === undefined) return undefined;
            return page.urls.text;
        },
        fetch: function (options) {

            var self = this;

            if ((options||{}).currentOnly) {
                
                return $.get(this.urlBase)
                    .done( handlerFactory('current'));
            } else {

                return $.when(
                    $.get(this.urlBase)
                        .done( handlerFactory ('current') ),
                    $.get(this.urlBase+'?r=0')
                        .done ( handlerFactory ('original') )
                    );

            }

            function handlerFactory (prop) {

                return function (data) {

                    self[prop] = data;
                    self[prop+'Pages'] = data.Revision.pages.sort( sorter );

                }

            }

            function sorter (a,b) {
                var aN = parseInt(a.number,10);
                var bN = parseInt(b.number,10);
                return aN - bN;
            };

        },
        saveDirtyPages : function () { 

            var dirtyPages = this.dirtyPages();
            var self = this;

            if (dirtyPages.length == 0) {
                
                console.log('nothing to save.');
                return;

            }

            var data = _.map(dirtyPages,function (p) {

                // BUG: pageNumber should be what comes out from ocruidoc i
                // guess. Now it works if pages are numbered continuously
                // 1... Otherwise this overwrites wrong pages
                var i = p.get('pageNumber');

                var xml = p.getAsAltoXML();
                window.xx = xml
                console.log(xml);
                var xmlString = (new XMLSerializer()).serializeToString(xml);
                var b64String = base64.encode(xmlString);

                return '--frontier\r\n' +
                       'Content-Type: application/octet-stream\r\n' +
                       'Content-Transfer-encoding: base64\r\n' + 
                       'Content-Disposition: form-data; name="' + i +
                       '"; filename="' + i + '"\r\n' + '\r\n' +
                       b64String + '\r\n';

            });

            var options = {

                data : data + '--frontier--\n',
                type:'POST',
                headers: {
                    'X-Authenticated-User':'1'
                },
                url: this.urlBase,
                contentType: 'multipart/form-data; boundary=frontier',
                processData: false
            };

            console.log('Now PUTing');

            $.ajax(options)
                .done( function (x) {

                    self.fetch({currentOnly:true})
                        .done( function () {

                            events.trigger('saved');
                            console.log('doc refreshed');

                        });

                    console.log('success');

                } )
                .fail( function (x) {

                    console.log('error');
                    events.trigger('saveFailed');

                } );

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
                promise.reject("Cannot load document.");
                console.log(err);
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

