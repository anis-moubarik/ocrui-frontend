define(['spinner','events','alto','mets','image','toolbar'],
        function (spinner,events,alto,mets,image,toolbar) {

    var doc; // this is used to store mets currently being edited

    toolbar.registerButton({
        id:"save",
        toggle:false,
        text:"Save",
        title:"Save",
        modes:["page"],
        click: function () {
            console.log('should now PUT');
        }
    });


    function route_empty() {


        /*
        toolbar.view.setMode('empty');
        toolbar.view.render();
        facsimile.empty.render();
        editor.empty.render();
        */
        $(window).resize();
    }

    function route_doc(id) {

        /*
        toolbar.view.setMode('doc');
        toolbar.view.render();
        mets.load({id:id},function(doc) {
            facsimile.thumbnails.render();
            editor.empty.render();
            $(window).resize();
        });
        */
    }

    function route_page(docId,pageId) {

        var pageNumber = Math.floor(parseInt(pageId,10));
        var data = {docId:docId, pageNumber:pageNumber};
        var imageRendered = new $.Deferred();
        var editorRendered = new $.Deferred();
        var allRendered = $.when(imageRendered,editorRendered);

        events.trigger('changePage',pageNumber);
        spinner.showSpinner();

        mets.get(data,function(_doc) {
            doc = _doc;
            events.trigger('changePageMets',doc);
        });

        image.get(data,function(image) {
            events.trigger('changePageImage',image);
            imageRendered.resolve();
        });

        alto.get(data,function(alto) {
            events.trigger('changePageAlto',alto);
            editorRendered.resolve();
        });

        allRendered.then(function() {
            spinner.hideSpinner();
            events.trigger('changePageDone');
        });

    }

    return {
        route_empty:route_empty,
        route_doc:route_doc,
        route_page:route_page
    };

});
