define(['events','backbone'],
        function (events,Backbone) {
    "use strict";

    var Router = Backbone.Router.extend({
        routes:{
            "": "default",
            ":id": "document",
            ":id/": "document",
            ":id/:page": "page",
            ":id/:page/": "page",
            ":id/:page/:viewport": "pageVP"
        }
    });

    var currentPageNumber = undefined;
    var currentDocId = undefined;
    var router = new Router();

    events.on('appReady', function() { Backbone.history.start(); });

    router.on("route:default", function routeEmpty() {

        events.trigger('message','Default view');
    });

    router.on("route:document", function routeDoc(id) {

        events.trigger('message','Document view');

    });
    
    router.on("route:page", routePage);
    function routePage(docId,pageId) {

        var pageNumber = Math.floor(parseInt(pageId,10));

        if (currentDocId != docId) {
            events.trigger('changeDocument',{
                docId:docId
            });
            currentDocId = docId;
        }

        if (currentPageNumber != pageNumber) {
            events.trigger('changePage',{
                pageNumber:pageNumber
            });
            currentPageNumber = pageNumber;
        }

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
            events.trigger('newViewportRequest',vp);
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

    events.on('changePageDone',function (data) {

        var parts = Backbone.history.fragment.split('/');
        var route = parts[0] + '/' + data.pageNumber;
        if (parts[2] !== undefined) route += '/' + parts[2];
        router.navigate(route,{replace:true,trigger:false});

    });

    return {
        // expose these for testing
        fragment: Backbone.history.fragment,
        router: router
    };

});



