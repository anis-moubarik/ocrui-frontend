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

    AltoModel = Backbone.Model.extend({
        initialize: function (options) {
            this.url = options.url;
        },
        getWordAt: function(x,y) {
            var selection = undefined;
            x = Math.round(x);
            y = Math.round(y);
            console.log(x,y);

            var minDistance = undefined;
            var minDistanceIndex = undefined;
            // find bounding box under or closest to the cursor.
            $(this.data).find('String').each(function(i) {

                var hpos = parseInt(this.getAttribute('HPOS'));
                var vpos = parseInt(this.getAttribute('VPOS'));
                var width = parseInt(this.getAttribute('WIDTH'));
                var height = parseInt(this.getAttribute('HEIGHT'));

                function tryToSetClosestCorner(cornerX,cornerY) {
                    var distance = Math.sqrt(
                        (cornerX - x) ^ 2 +
                        (cornerY - y) ^ 2 
                    );
                    if ((minDistance == undefined) || (distance < minDistance))
                    {
                        minDistance = distance;
                        minDistanceIndex = i;
                    }
                };
                tryToSetClosestCorner(hpos,vpos);
                tryToSetClosestCorner(hpos+width,vpos);
                tryToSetClosestCorner(hpos,vpos+height);
                tryToSetClosestCorner(hpos+width,vpos+height);

                if ((x >= hpos) && (x <= hpos + width) &&
                    (y >= vpos) && (y <= vpos + height)) {

                    var content = this.getAttribute('CONTENT');
                    console.log(hpos,vpos,width,height,content);
                    selection = i;
                    return false;

                }

            });
            if (selection == undefined) {
                selection = minDistanceIndex;
            }
            console.log(selection);
            return selection;
        },
        getNthWord: function(index) {
            var dom =  $(this.data).find('String').get(index);
            if (dom == undefined) return undefined;
            return {
                content: dom.getAttribute('CONTENT'),
                hpos: dom.getAttribute('HPOS'),
                vpos: dom.getAttribute('VPOS'),
                width: dom.getAttribute('WIDTH'),
                height: dom.getAttribute('HEIGHT'),
            }
        },
        getStringSequence: function() {
            xx = [];
            return $(this.data).find('String').map(
                function() {xx.push(this);return this.getAttribute('CONTENT');}
            ).get();
        },

        getString: function() {
            return this.getStringSequence().join(' ');
        },
        fetch: function (callback) {
            var that = this;
            var jqxhr = $.ajax(this.url).always(function(data,textStatus) {
                    that.data = data,
                    that.set('status',textStatus);
                    callback(that);
                });
        }
    });

    ImageModel = Backbone.Model.extend({
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

    var documents = {};
    var images = {};
    var altos = {};

    function loadDocument(options,callback) {
        if (options.id in documents) {
            callback(documents[options.id]);
        } else {
            var doc = new DocumentModel(options);
            documents[options.id] = doc;
            doc.fetch(callback);
        }
    }

    function loadAlto(options,callback) {
        if (options.url in altos) {
            callback(altos[options.url]);
        } else {
            var alto = new AltoModel(options);
            altos[options.url] = alto;
            alto.fetch(callback);
        }
    }

    function loadImage(options,callback) {
        if (options.url in images) {
            callback(images[options.url]);
        } else {
            var image = new ImageModel(options);
            images[options.url] = image;
            image.fetch(callback);
        }
    }

    return {
        loadDocument: loadDocument,
        loadAlto: loadAlto,
        loadImage: loadImage,
    }
});
