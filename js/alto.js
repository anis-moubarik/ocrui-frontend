define(['backbone'],function () {



    AltoModel = Backbone.Model.extend({
        initialize: function (options) {
            this.url = options.url;
        },
        getWords: function() {

            var words = $(this.data).find('String').map(function(i) {
                return {
                    hpos : parseInt(this.getAttribute('HPOS')),
                    vpos : parseInt(this.getAttribute('VPOS')),
                    width : parseInt(this.getAttribute('WIDTH')),
                    height : parseInt(this.getAttribute('HEIGHT')),
                    content : this.getAttribute('CONTENT'),
                }
                
            }).get();
            return words;

        },
        getWordAt: function(x,y) {
            var selection = undefined;
            x = Math.round(x);
            y = Math.round(y);

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

    var altos = {};

    function load(options,callback) {
        if (options.url in altos) {
            callback(altos[options.url]);
        } else {
            var alto = new AltoModel(options);
            altos[options.url] = alto;
            alto.fetch(callback);
        }
    }

    return {
        load: load,
    }
});
