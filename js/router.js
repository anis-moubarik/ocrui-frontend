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

    router.on("route:default", function routeEmpty() {

        events.trigger('message','Default view');
    });

    router.on("route:document", function routeDoc(id) {

        events.trigger('message','Document view');

    });

    router.on("route:page", function routePage(docId,pageId) {

        var pageNumber = Math.floor(parseInt(pageId,10));
        var data = {docId:docId, pageNumber:pageNumber};

        events.trigger('changePage',pageNumber);
        spinner.showSpinner();

        var imageLoaded = image.get(data);
        var altoLoaded = alto.get(data);
        var allLoaded = $.when(imageLoaded,altoLoaded);

        mets.get(data).then(
            function(doc) { events.trigger('changePageMets',doc); },
            function(msg) { events.trigger('changePageMetsError',msg); });

        imageLoaded.then(
            function(img) { events.trigger('changePageImage',img); },
            function(msg) { events.trigger('changePageImageError',msg); });

        altoLoaded.then(
            function(myAlto) { events.trigger('changePageAlto',myAlto); },
            function(msg) { events.trigger('changePageAltoError',msg); });

        allLoaded.then(
            function() {
                events.trigger('changePageDone');
                spinner.hideSpinner();
            },
            function(msg) {
                events.trigger('changePageError',msg);
                spinner.hideSpinner();
            });

    });

    events.on('requestChangePage',function gotoPage(number) {

        // TODO: queue requests and only handle last one

        var parts = Backbone.history.fragment.split('/');
        var route = parts[0]+'/'+number;
        router.navigate(route,{replace:true,trigger:true});

    });

    return { };

});



