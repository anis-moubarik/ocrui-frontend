define(['jquery','diffmethod','backbone'],function ($,diffmethod,Backbone) {
    "use strict";

    var AltoModel = Backbone.Model.extend({
        initialize: function (options) {
            this.url = options.url;
        },
        dom2Word: function(dom) {
            return {
                content: dom.getAttribute('CONTENT'),
                hpos: parseInt(dom.getAttribute('HPOS'),10)/this.get('width'),
                vpos: parseInt(dom.getAttribute('VPOS'),10)/this.get('height'),
                width: parseInt(dom.getAttribute('WIDTH'),10)/this.get('width'),
                height: parseInt(dom.getAttribute('HEIGHT'),10)/this.get('height')
            };
        },
        getWords: function() {

            var that = this;
            var words = $(this.currentData).find('String').map(function() {
                return that.dom2Word(this);
            }).get();
            return words;

        },
        getWordIndexAt: function(x,y) {
            var selection;

            var minDistance;
            var minDistanceIndex;
            var that=this;
            // find bounding box under or closest to the cursor.
            $(this.currentData).find('String').each(function(i) {

                var word = that.dom2Word(this);

                // look for an exact match
                if ((x >= word.hpos) && (x <= word.hpos + word.width) &&
                    (y >= word.vpos) && (y <= word.vpos + word.height)) {

                    selection = i;
                    return false;

                }

                // look for a bounding box nearby
                function tryToSetClosestCorner(cornerX,cornerY) {
                    var distance = Math.sqrt(
                        Math.pow((cornerX - x), 2) +
                        Math.pow((cornerY - y), 2)
                    );
                    if ((minDistance === undefined) || (distance < minDistance))
                    {
                        minDistance = distance;
                        minDistanceIndex = i;
                    }
                }
                tryToSetClosestCorner(word.hpos,word.vpos);
                tryToSetClosestCorner(word.hpos+word.width,word.vpos);
                tryToSetClosestCorner(word.hpos,word.vpos+word.height);
                tryToSetClosestCorner(word.hpos+word.width,word.vpos+word.height);

            });
            if (selection === undefined) {
                selection = minDistanceIndex;
            }
            return selection;
        },
        updateAlto: function (content) {

            // create new Alto based on string in content and
            // original alto structure
            if (this.originalData === undefined) {return;}
            if (words) {return;}
            var words = content.split(/\s+/);
            this.currentData = diffmethod.createAlto( this.originalData,words );

        },

        getNthWord: function(index) {
            var dom =  $(this.currentData).find('String').get(index);
            if (dom === undefined) {return undefined;}
            return this.dom2Word(dom);
        },
        getStringSequence: function(dom) {
            if (dom === undefined) {dom = this.currentData;}
            return $(dom).find('String').map(
                function() { return this.getAttribute('CONTENT'); }
            ).get();
        },
        getChangedSequence: function(dom) {
            if (dom === undefined) {dom = this.currentData;}
            return $(dom).find('String').map(
                function() { return this.getAttribute('CHANGED') ? true : false; }
            ).get();
        },

        getString: function(dom) {
            return this.getStringSequence(dom).join(' ');
        },

        fetch: function (callback) {
            var that = this;
            $.ajax(this.url).always(function(data,textStatus) {
                that.currentData = data;
                that.originalData = data; // BUG! figure out how this goes
                var page = $(data).find('Page').get(0);
                if (page) {
                    that.set('width',page.getAttribute("WIDTH"));
                    that.set('height',page.getAttribute("HEIGHT"));
                }
                that.set('status',textStatus);
                callback(that);
            });
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
        load: load
    };
});
