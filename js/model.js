define(['backbone'],function (backbone) {


    DocumentModel = Backbone.Model.extend({
        initialize: function (options) {
            this.id = options.docId;
        },
        fetch: function (options,callback) {
            var url = 'items/'+this.id+'/mets.xml';
            var that = this;
            $.get(url,
                function(data) {
                    that.data = data;
                    that.set('status','');
                    callback(that);
                });
        }
    });

    AltoModel = Backbone.Model.extend({
        initialize: function (options) {
            this.id = options.id;
            this.docId = options.docId;
            this.pageId = options.pageId;
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
        fetch: function (options,callback) {
            url = 'items/'+this.docId+'/alto/img'+this.pageId+'-alto.xml';
            var that = this;
            var jqxhr = $.ajax(url).always(function(data,textStatus) {
                    that.data = data,
                    that.set('status',textStatus);
                    callback(that);
                });
        }
    });

    ImageModel = Backbone.Model.extend({
        initialize: function (options) {
            this.id = options.id;
            this.docId = options.docId;
            this.pageId = options.pageId;
        },
        fetch: function (options,callback) {
            var that = this;
            this.image = new Image();
            this.image.src = 'items/'+this.docId+'/access_img/img'+this.pageId+'-access.jpg';
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
            doc.fetch({},callback);
            documents[options.id] = doc;
        }
    }

    function loadAlto(options,callback) {
        if (options.id in altos) {
            callback(altos[options.id]);
        } else {
            var alto = new AltoModel(options);
            alto.fetch({},callback);
            altos[options.id] = alto;
        }
    }

    function loadImage(options,callback) {
        if (options.id in images) {
            callback(images[options.id]);
        } else {
            var image = new ImageModel(options);
            image.fetch({},callback);
            images[options.id] = image;
        }
    }

    return {
        loadDocument: loadDocument,
        loadAlto: loadAlto,
        loadImage: loadImage,
    }
});
