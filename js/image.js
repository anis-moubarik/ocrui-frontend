/*globals Image:false */
define(['jquery','mybackbone','mets'],function ($,mybackbone,mets) {
    "use strict";

    var ImageModel = mybackbone.Model.extend({
        initialize: function (options) {
            this.url = options.url;
            this.loading = new $.Deferred();
            this.image = new Image();
        },
        fetch: function () {
            this.image.src = this.url;
            var that = this;
            this.image.onload = function() { 
                that.set('width', this.width);
                that.set('height', this.height);
                that.loading.resolve(that);
            };
            this.image.onerror = function() { 
                that.loading.reject(that);
            }
        }
    });

    var images = {};

    function get(options,callback) {

        var promise = new $.Deferred();

        mets.getCurrent().then(
            function (doc) {
                var imageOptions = {
                    docId: options.docId,
                    pageNumber: options.pageNumber,
                    versionNumber: options.versionNumber,
                    id: options.docId+'/'+options.pageNumber,
                    url: doc.getImageUrl(options.pageNumber)
                };
                var image = images[imageOptions.id];
                if (image === undefined) {
                    try {
                        image = new ImageModel(imageOptions);
                    } catch (err) {
                        promise.reject(err);
                        return;
                    }

                    images[imageOptions.id] = image;
                    image.fetch();
                }
                image.loading.then(
                    function () {promise.resolve(image);},
                    function () {promise.reject("Cannot load image");}
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
