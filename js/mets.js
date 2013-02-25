define(['jquery','mybackbone','events'],function ($,mybackbone,events) {
    "use strict";

    var DocumentModel = mybackbone.Model.extend({
        initialize: function (options) {
            this.id = options.id;
            this.urlBase = 'items/'+this.id;
            this.url = this.urlBase+'/mets.xml';
            this.pageInfo = [];
        },
        dirtyPages: function() {
            var dirtyPages = [];
            for (var i in this.pageInfo) {
                var pageNumber = i + 1;
                var pageInfo = this.pageInfo[i];
                if (pageInfo === undefined) { continue; }
                var alto = pageInfo[2];
                if (alto === undefined) { continue; }
                if (alto.isDirty()) { dirtyPages.push(alto); }
            }
            return dirtyPages;
        },
        registerAlto: function(pageNumber,alto) {
            var myPageInfo = this.pageInfo[pageNumber - 1];
            if (myPageInfo) {
                myPageInfo[2] = alto;
            } else {
                throw 'Pagenumber ' + pageNumber + ' does not exist';
            }
        },
        isDirty: function() {
            return this.dirtyPages().length > 0;
        },
        getNumberOfPages : function () {
            return this.pageInfo.length;
        },
        getImageThumbnailUrl : function (pageNumber) {
            var page = this.pageInfo[pageNumber - 1]; //pageNumber is 1-based
            if (page === undefined) return undefined;
            return this.urlBase + '/' + page[3];
        },
        getImageUrl : function (pageNumber) {
            var page = this.pageInfo[pageNumber - 1]; //pageNumber is 1-based
            if (page === undefined) return undefined;
            return this.urlBase + '/' + page[0];
        },
        getAltoUrl : function (pageNumber) {
            var page = this.pageInfo[pageNumber - 1]; //pageNumber is 1-based
            if (page === undefined) return undefined;
            return this.urlBase + '/' + page[1];
        },
        parsePageInfo : function (data) {

            var that = this;

            this.metsType = $(data).find('mets\\:mets, mets').attr('TYPE');


            if (this.metsType == 'METAe_Monograph') {

                // loop through image files
                $(data).find('fileGrp[ID="IMGGRP"] file').each(function() {
                    var seq = parseInt(this.getAttribute('SEQ'),10);
                    var element = $(this).find('FLocat').get(0);
                    var imageFilename = element.getAttribute('xlink:href');
                    imageFilename = imageFilename.replace(/^file:\/\//,'').replace(/.\//,'');
                    var tnFilename = 'small-' + imageFilename;
                    that.pageInfo[seq] = [imageFilename,undefined,undefined,tnFilename];
                });

                // loop through alto files
                $(data).find('fileGrp[ID="ALTOGRP"] file').each(function() {
                    var seq = parseInt(this.getAttribute('SEQ'),10);
                    var element = $(this).find('FLocat').get(0);
                    var altoFilename = element.getAttribute('xlink:href');
                    altoFilename = altoFilename.replace(/^file:\/\//,'').replace(/.\//,'');
                    if (that.pageInfo[seq] === undefined) {
                        that.pageInfo[seq] = [undefined,undefined,undefined,undefined];
                    }
                    that.pageInfo[seq][1] = altoFilename;
                });

            } else if (this.metsType == 'Newspaper') {
                $(data).find('fileGrp[ID="IMGGRP"] file').each(function() {
                    var seq = parseInt(this.getAttribute('SEQ'),10);
                    var element = $(this).find('FLocat').get(0);
                    var imageFilename = element.getAttribute('xlink:href');
                    imageFilename = imageFilename.replace(/^file:\/\/\.\/preservation_img\/pr/,'access_img\/ac');
                    imageFilename = imageFilename.replace(/jp2$/,'jpg');
                    that.pageInfo[seq] = [imageFilename,undefined,undefined,undefined];
                });

                // loop through alto files
                var i = 1;
                $(data).find('fileGrp[ID="ALTOGRP"] file').each(function() {
                    var seq = i++;
                    var element = $(this).find('FLocat').get(0);
                    var altoFilename = element.getAttribute('xlink:href');
                    altoFilename = altoFilename.replace(/^file:\/\//,'').replace(/.\//,'');
                    if (that.pageInfo[seq] === undefined) {
                        that.pageInfo[seq] = [undefined,undefined,undefined,undefined];
                    }
                    that.pageInfo[seq][1] = altoFilename;
                });
            } else {

                // loop through mets somehow
                $(data).find('mets\\:area, area').each(function() {
                    //var seq = parseInt(this.getAttribute('SEQ'),10);
                    var fileId = this.getAttribute('FILEID');
                    var seqString = fileId.substring(3,7);
                    var seq = parseInt(seqString,10);
                    var imageFilename = 'access_img/img'+seqString+'-access.jpg';
                    var tnFilename = 'thumb_img/img'+seqString+'-thumb.jpg';
                    var altoFilename = 'alto/img'+seqString+'-alto.xml';
                    that.pageInfo[seq] = [imageFilename,altoFilename,undefined,tnFilename];
                });

            }

            // Remove empty slots in pageInfo
            for (var i=0; i < this.pageInfo.length; i++) {
                while ((i < this.pageInfo.length) &&
                        (this.pageInfo[i] === undefined)) {
                    this.pageInfo.splice(i,1);
                }
            }
            
        },
        parse: function (response) {
            this.data = response;
            this.parsePageInfo(response);
            return {};
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
            function () {promise.reject("Cannot load document.");}
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

