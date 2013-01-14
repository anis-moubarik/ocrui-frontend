define(['backbone'],function (backbone) {

    Document = Backbone.Model.extend({
        initialize: function (options) {
            this.id = options.doc;
        },
        fetch: function (options,callback) {
            var that = this;
            var url = 'items/'+this.id+'/mets.xml';
            $.get(url,function(data) {
                that.data = data;
                callback();
            });
        }
    });

    Page = Backbone.Model.extend({
        initialize: function (options) {
            this.id = options.page;
            this.doc = options.doc;
        },
        fetch: function (options,callback) {
            var that = this;
            this.image = new Image();
            this.image.src = 'items/'+this.doc+'/access_img/img'+this.id+'-access.jpg';
            this.image.onload = function() { callback(that); };
        }
    });

    var documents = {};
    var pages = {};

    function loadDocument(options,callback) {
        var docId = options.doc;
        if (docId in documents) {
            callback(documents[docId]);
        } else {
            var doc = new Document(options);
            doc.fetch({},callback);
            documents[docId] = doc;
        }
    }

    function loadPage(options,callback) {
        var docId = options.doc;
        var pageId = options.page;
        var id = docId + '/' + pageId;
        if (id in pages) {
            callback(pages[id]);
        } else {
            var page = new Page(options);
            page.fetch({},callback);
            pages[id] = page;
        }
    }

    return {
        loadDocument: loadDocument,
        loadPage: loadPage,
    }
});
