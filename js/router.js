define(['spinner','events','alto','mets','image','backbone'],
        function (spinner,events,alto,mets,image,Backbone) {
    "use strict";

    var Router = Backbone.Router.extend({
        routes:{
            "": "default",
            ":id": "document",
            ":id/:page": "page"
        }
    });

    var router = new Router();
    router.on("route:default",routeEmpty);
    router.on("route:document",routeDoc);
    router.on("route:page",routePage);

    function gotoPage(pageNumber) {

        var parts = Backbone.history.fragment.split('/');
        var route = parts[0]+'/'+pageNumber;
        router.navigate(route,{replace:true,trigger:true});
    }

    function routeEmpty() {

    }

    function routeDoc(id) {

    }

    function routePage(docId,pageId) {

        var pageNumber = Math.floor(parseInt(pageId,10));
        var data = {docId:docId, pageNumber:pageNumber};
        var imageRendered = new $.Deferred();
        var editorRendered = new $.Deferred();
        var allRendered = $.when(imageRendered,editorRendered);

        events.trigger('changePage',pageNumber);
        spinner.showSpinner();

        mets.get(data,function(doc) {
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
        gotoPage:gotoPage
    };

});



