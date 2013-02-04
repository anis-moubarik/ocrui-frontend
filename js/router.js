define(['events','alto','mets','image','backbone'],
        function (events,alto,mets,image,Backbone) {
    "use strict";

    var Router = Backbone.Router.extend({
        routes:{
            "": "default",
            ":id": "document",
            ":id/:page": "page",
            ":id/:page/:viewport": "pageVP"
        }
    });

    var router = new Router();

    router.on("route:default", function routeEmpty() {

        events.trigger('message','Default view');
    });

    router.on("route:document", function routeDoc(id) {

        events.trigger('message','Document view');

    });

    router.on("route:page", routePage);
    function routePage(docId,pageId) {

        var pageNumber = Math.floor(parseInt(pageId,10));
        var data = {docId:docId, pageNumber:pageNumber};

        events.trigger('changePage',pageNumber);
        events.trigger('nowProcessing',"page-change");

        var imageLoaded = image.get(data);
        var altoLoaded = alto.get(data);

        mets.get(data).then(
            function(doc) { events.trigger('changePageMets',doc); },
            function(msg) { events.trigger('changePageMetsError',msg); });

        imageLoaded.then(
            function(img) { events.trigger('changePageImage',img); },
            function(msg) { events.trigger('changePageImageError',msg); });

        altoLoaded.then(
            function(myAlto) { events.trigger('changePageAlto',myAlto); },
            function(msg) { events.trigger('changePageAltoError',msg); });

        $.when(imageLoaded,altoLoaded).then(
            function() {
                events.trigger('changePageDone');
                events.trigger('endProcessing',"page-change");
            },
            function(msg) {
                events.trigger('changePageError',msg);
                events.trigger('endProcessing',"page-change");
            });

    }
    router.on("route:pageVP", function routePageVP(docId,pageId,viewport) {
        events.on('changePageDone',function() {
            var parts = viewport.split('x');
            if (parts.length != 3) return;
            var vp = {
                originX: parseInt(parts[0],10),
                originY: parseInt(parts[1],10),
                pageScale: parseFloat(parts[2])
            }
            events.delay('newViewportRequest',vp);
        });
        routePage(docId,pageId);
    });


    events.on('newViewport',function newViewport(vp) {
        var route = '';
        var parts = Backbone.history.fragment.split('/');
        var viewRoute = vp.originX + 'x' + vp.originY + 'x' + vp.pageScale;
        var route = parts[0] + '/' + parts[1] + '/' + viewRoute;
        router.navigate(route,{replace:true,trigger:false});
    });

    events.on('requestChangePage',function gotoPage(number) {

        var parts = Backbone.history.fragment.split('/');
        var route = parts[0]+'/'+number;
        router.navigate(route,{replace:false,trigger:true});

    });

    return {
        // expose these for testing
        fragment: Backbone.history.fragment,
        router: router
    };

});



