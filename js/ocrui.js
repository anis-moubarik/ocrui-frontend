define(['events','model','backbone','facsimile','editor'],function (events,model,backbone,facsimile,editor) {


    var renderOptions = {};

    function empty() {

        facsimile.empty.render();
        editor.empty.render();
        $(window).resize();
    };

    function doc(id) {

        renderOptions = {
            id: id,
            docId: id,
            pageId: undefined,
        }
        model.loadDocument(renderOptions,function(doc) {
            renderOptions.doc = doc;
            facsimile.thumbnails.render(renderOptions);
            editor.empty.render(renderOptions);
            $(window).resize();
        });
    };

    function page(id,page) {
        renderOptions = {
            id: id + '/' + page,
            docId: id,
            pageId: page,
        }
        var progressCounter;

        model.loadDocument(renderOptions,function(doc) {
            renderOptions.doc = doc;
            progressCounter ++ ;
            if (progressCounter == 3) doneLoading();

        });

        model.loadImage(renderOptions,function(image) {
            renderOptions.image = image;
            facsimile.view.render(renderOptions);
            progressCounter ++ ;
            if (progressCounter == 3) doneLoading();
        });

        model.loadAlto(renderOptions,function(alto) {
            renderOptions.alto = alto;
            editor.view.render(renderOptions);
            progressCounter ++ ;
            if (progressCounter == 3) doneLoading();
        });

        function doneLoading() {
            $(window).resize();
        }


        //router.navigate(id+"/1",{replace:true,trigger:true});
    };

    var Router = Backbone.Router.extend({
        routes:{
            "": "default",
            ":id": "document",
            ":id/:page": "page",
        }
    });

    return {
        empty:empty,
        doc:doc,
        page:page,
        events:events,
    };

});
