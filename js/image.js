/*globals Image:false */
define(['backbone'],function (Backbone) {
    "use strict";

    var ImageModel = Backbone.Model.extend({
        initialize: function (options) {
            this.url = options.url;
        },
        fetch: function (callback) {
            var that = this;
            this.image = new Image();
            this.image.src = this.url;
            this.image.onload = function() { 
                that.width = this.width;
                that.height = this.height;
                callback(that);
            };
        }
    });

    var images = {};

    function load(options,callback) {
        if (options.url in images) {
            callback(images[options.url]);
        } else {
            var image = new ImageModel(options);
            images[options.url] = image;
            image.fetch(callback);
        }
    }

    return {
        load: load
    };
});
