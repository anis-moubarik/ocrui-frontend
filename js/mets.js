define(['backbone'],function () {

    DocumentModel = Backbone.Model.extend({
        initialize: function (options) {
            this.id = options.id;
            this.urlBase = 'items/'+this.id;
        },
        pageInfo: [],
        getNumberOfPages : function () {
            return this.pageInfo.length;
        },
        getImageUrl : function (pageNumber) {
            var page = this.pageInfo[pageNumber];
            if (page == undefined) return undefined;
            return this.urlBase + '/' + page[0];
        },
        getAltoUrl : function (pageNumber) {
            var page = this.pageInfo[pageNumber];
            if (page == undefined) return undefined;
            return this.urlBase + '/' + page[1];
        },
        parsePageInfo : function (data) {

            var that = this;

            this.metsType = $(data).find('mets\\:mets, mets').attr('TYPE');

            if (this.metsType == 'METAe_Monograph') {

                // loop through image files
                $(data).find('fileGrp[ID="IMGGRP"] file').each(function() {
                    var seq = parseInt(this.getAttribute('SEQ'));
                    var element = $(this).find('FLocat').get(0)
                    var imageFilename = element.getAttribute('xlink:href');
                    imageFilename = imageFilename.replace(/^file:\/\//,'').replace(/.\//,'');
                    that.pageInfo[seq] = [imageFilename,undefined];
                });

                // loop through alto files
                $(data).find('fileGrp[ID="ALTOGRP"] file').each(function() {
                    var seq = parseInt(this.getAttribute('SEQ'));
                    var element = $(this).find('FLocat').get(0)
                    var altoFilename = element.getAttribute('xlink:href');
                    altoFilename = altoFilename.replace(/^file:\/\//,'').replace(/.\//,'');
                    if (that.pageInfo[seq] == undefined) {
                        that.pageInfo[seq] = [undefined,undefined];
                    }
                    that.pageInfo[seq][1] = altoFilename;
                });

            } else {

                // loop through mets somehow
                $(data).find('mets\\:area, area').each(function() {
                    //var seq = parseInt(this.getAttribute('SEQ'));
                    var fileId = this.getAttribute('FILEID');
                    var seqString = fileId.substring(3,7);
                    var seq = parseInt(seqString);
                    var imageFilename = 'access_img/img'+seqString+'-access.jpg';
                    var altoFilename = 'alto/img'+seqString+'-alto.xml';
                    that.pageInfo[seq] = [imageFilename,altoFilename];
                });

            }
        },
        fetch: function (callback) {
            var url = this.urlBase+'/mets.xml';
            var that = this;
            $.get(url, function(data) {
                that.data = data;
                that.parsePageInfo(data);
                that.set('status','');
                callback(that);
            });
        }
    });

    var documents = {};

    function load(options,callback) {
        if (options.id in documents) {
            callback(documents[options.id]);
        } else {
            var doc = new DocumentModel(options);
            documents[options.id] = doc;
            doc.fetch(callback);
        }
    }

    return {
        load: load,
    }

});

