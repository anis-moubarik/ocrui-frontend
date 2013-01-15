define(['events','model','facsimile','editor'],function (events,model,facsimile,editor) {

    var doc = undefined; // this is used to store mets currently being edited

    function empty() {

        facsimile.empty.render();
        editor.empty.render();
        $(window).resize();
    };

    function doc(id) {

        model.loadDocument({id:id},function(doc) {
            facsimile.setDoc(doc);
            facsimile.thumbnails.render();
            editor.empty.render();
            $(window).resize();
        });
    };

    function page(id,pageNumber) {

        model.loadDocument({id:id},function(_doc) {

            var progressCounter;
            var pages = _doc.getNumberOfPages();

            doc = _doc;

            var url = _doc.getImageUrl(parseInt(pageNumber));
            model.loadImage({url:url},function(image) {
                facsimile.view.setImage(image);
                facsimile.view.render();
                progressCounter ++ ;
                if (progressCounter == 2) doneLoading();
            });

            var url = _doc.getAltoUrl(parseInt(pageNumber));
            model.loadAlto({url:url},function(alto) {
                editor.view.setAlto(alto);
                editor.view.render();
                progressCounter ++ ;
                if (progressCounter == 2) doneLoading();
            });

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
