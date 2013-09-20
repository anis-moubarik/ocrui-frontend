/*globals Image:false */
define(['jquery','mybackbone','ocruidoc'],function ($,mybackbone,mets) {
    "use strict";

    var ImageModel = mybackbone.Model.extend({
        initialize: function (options) {
            this.loading = new $.Deferred();
            this.tnLoading = new $.Deferred();
            this.urlSet = new $.Deferred();
            this.image = new Image();
            this.tnImage = new Image();
        },
        setUrl: function (url,tnUrl) {
            this.url = url;
            this.tnUrl = tnUrl;
            this.urlSet.resolve();
        },
        tnFetch: function () {
            var that = this;
            this.urlSet.done( function () {
                that.tnImage.src = that.tnUrl || '';
                that.tnImage.onload = function() { 
                    that.set('tnWidth', this.width);
                    that.set('tnHeight', this.height);
                    that.tnLoading.resolve(that);
                };
                that.tnImage.onerror = function() { 
                    that.tnLoading.reject(that);
                };
            });
        },
        fetch: function () {
            var that = this;
            this.urlSet.done(function() {
                that.image.src = that.url || '';
                that.image.onload = function() { 
                    that.set('width', this.width);
                    that.set('height', this.height);
                    that.loading.resolve(that);
                };
                that.image.onerror = function() { 
                    that.loading.reject(that);
                };
            });
        }
    });

    var images = {};

    function get(options,callback) {

        if (options.docId === undefined) {
            options.docId = mets.getCurrentDocId();
        }

        var imageOptions = {
            docId: options.docId,
            pageNumber: options.pageNumber,
            versionNumber: options.versionNumber,
            id: options.docId+'/'+options.pageNumber,
        }

        var image = images[imageOptions.id];
        if (image === undefined) {
            image = new ImageModel(imageOptions);
            images[imageOptions.id] = image;
        }

        mets.get(options.docId).done(
            function (doc) {
                image.setUrl(
                    doc.getImageUrl(options.pageNumber),
                    doc.getImageThumbnailUrl(options.pageNumber)
                    );
            }
        );

        return image;

    }

    return {
        get: get
    };
});
