define(['events','model','facsimile','editor','toolbar'],
        function (events,model,facsimile,editor,toolbar) {

    var doc = undefined; // this is used to store mets currently being edited

    function route_empty() {


        toolbar.view.setOptions({
            displayPageSelector: false,
        });
        toolbar.view.render();
        facsimile.empty.render();
        editor.empty.render();
        $(window).resize();
    };

    function route_doc(id) {

        toolbar.view.setOptions({
            displayPageSelector: false,
        });
        toolbar.view.render();
        model.loadDocument({id:id},function(_doc) {
            doc = _doc;
            facsimile.thumbnails.render();
            editor.empty.render();
            $(window).resize();
        });
    };

    function route_page(id,pageNumber) {

        var intPageNumber = Math.floor(parseInt(pageNumber));
        toolbar.view.setOptions({
            displayPageSelector: true,
            pageNumber: intPageNumber,
        });
        toolbar.view.render();
        model.loadDocument({id:id},function(_doc) {

            var progressCounter;
            var pages = _doc.getNumberOfPages();
            toolbar.view.setPageNumberBounds(1,pages);
            doc = _doc;

            var url = _doc.getImageUrl(intPageNumber);
            model.loadImage({url:url},function(image) {
                facsimile.view.setImage(image);
                facsimile.view.render();
                progressCounter ++ ;
                if (progressCounter == 2) doneLoading();
            });

            var url = _doc.getAltoUrl(intPageNumber);
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
        editor.view.showSpinner();
        facsimile.view.showSpinner();

    };

    return {
        route_empty:route_empty,
        route_doc:route_doc,
        route_page:route_page,
    };

});
