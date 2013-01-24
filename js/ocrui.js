define(['spinner','events','alto','mets','image','facsimile','editor','toolbar'],
        function (spinner,events,alto,mets,image,facsimile,editor,toolbar) {

    var doc; // this is used to store mets currently being edited

    toolbar.registerButton({
        id:"save",
        toggle:false,
        text:"Save",
        title:"Save",
        modes:["page"]});
    events.on('button-save-clicked',function () {
        console.log('should now PUT');
    });


    function route_empty() {


        toolbar.view.setMode('empty');
        toolbar.view.render();
        facsimile.empty.render();
        editor.empty.render();
        $(window).resize();
    }

    function route_doc(id) {

        toolbar.view.setMode('doc');
        toolbar.view.render();
        mets.load({id:id},function(_doc) {
            doc = _doc;
            facsimile.thumbnails.render();
            editor.empty.render();
            $(window).resize();
        });
    }

    function route_page(id,pageNumber) {

        var intPageNumber = Math.floor(parseInt(pageNumber,10));
        events.trigger('changePage',intPageNumber);
        toolbar.view.setMode('page');
        toolbar.view.render();
        spinner.showSpinner(2);

        var imageRendered = new $.Deferred();
        var editorRendered = new $.Deferred();
        mets.load({id:id},function(_doc) {


            var pages = _doc.getNumberOfPages();
            events.trigger('changePageBounds',{min:1,max:pages});
            spinner.hideSpinner();
            doc = _doc;

            var url = _doc.getImageUrl(intPageNumber);
            image.load({url:url},function(image) {
                facsimile.view.setImage(image);
                facsimile.view.render();
                spinner.hideSpinner();
                imageRendered.resolve();
            });

            url = _doc.getAltoUrl(intPageNumber);
            alto.load({url:url},function(alto) {
                editor.view.setAlto(alto);
                editor.view.render();
                editorRendered.resolve();
            });

        });

        $.when(imageRendered,editorRendered).then(function() {
            facsimile.view.render();
            $(window).resize();
            if (editor.view.cMirror) {
                editor.view.cMirror.focus();
            }
        });

    }

    return {
        route_empty:route_empty,
        route_doc:route_doc,
        route_page:route_page
    };

});
