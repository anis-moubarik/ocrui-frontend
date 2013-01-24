/*globals Image:false */
define(['jquery','backbone','mets'],function ($,Backbone,mets) {
    "use strict";

    var ImageModel = Backbone.Model.extend({
        initialize: function (options) {
            this.url = options.url;
            this.loading = new $.Deferred();
        },
        fetch: function (callback) {
            var that = this;
            this.image = new Image();
            this.image.src = this.url;
            this.image.onload = function() { 
                that.width = this.width;
                that.height = this.height;
                that.loading.resolve();
            };
        }
    });

    var images = {};

    function get(options,callback) {

        mets.get(options,function (doc) {
            var imageOptions = {
                docId: options.docId,
                pageNumber: options.pageNumber,
                versionNumber: options.versionNumber,
                id: options.docId+'/'+options.pageNumber,
                url: doc.getImageUrl(options.pageNumber)
            };
            var image = images[imageOptions.id];
            if (image === undefined) {
                image = new ImageModel(imageOptions);
                images[imageOptions.id] = image;
                image.fetch();
            }
            $.when(image.loading).then( function () { callback(image); });
        });
    }

    return {
        get: get
    };
});
