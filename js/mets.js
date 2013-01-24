define(['jquery','backbone','mybackbone'],function ($,Backbone,mybackbone) {
    "use strict";

    var DocumentModel = Backbone.Model.extend({
        initialize: function (options) {
            this.id = options.id;
            this.urlBase = 'items/'+this.id;
        },
        pageInfo: [],
        getNumberOfPages : function () {
            return this.pageInfo.length;
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
                    that.pageInfo[seq] = [imageFilename,undefined];
                });

                // loop through alto files
                $(data).find('fileGrp[ID="ALTOGRP"] file').each(function() {
                    var seq = parseInt(this.getAttribute('SEQ'),10);
                    var element = $(this).find('FLocat').get(0);
                    var altoFilename = element.getAttribute('xlink:href');
                    altoFilename = altoFilename.replace(/^file:\/\//,'').replace(/.\//,'');
                    if (that.pageInfo[seq] === undefined) {
                        that.pageInfo[seq] = [undefined,undefined];
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
                    var altoFilename = 'alto/img'+seqString+'-alto.xml';
                    that.pageInfo[seq] = [imageFilename,altoFilename];
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
        url: function () {
            console.log('get url');
            console.log(  this.urlBase+'/mets.xml');
            return  this.urlBase+'/mets.xml';
        },
        parse: function (response) {
            this.data = response;
            this.parsePageInfo(response);
            return {}
        },

        sync: mybackbone.sync

    });

    var documents = {};

    function get(options,callback) {

        var doc = documents[options.docId];

        if (doc === undefined) {

            doc = new DocumentModel({id:options.docId});
            documents[options.docId] = doc;
            doc.loading = doc.fetch();

        }

        $.when(doc.loading).then( function () { callback(doc); });

    }

    return {
        get: get
    };

});

