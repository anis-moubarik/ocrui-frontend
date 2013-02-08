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

    var currentPageNumber;
    var currentDocId;
    var changePageInProgress;
    var router = new Router();

    events.on('appReady', function() { Backbone.history.start(); });

    router.on("route:default", function routeEmpty() {

        events.trigger('message','Default view');

    });

    router.on("route:document", function routeDoc(id) {

        events.trigger('message','Document view');

    });
    
    router.on("route:page", routePage);
    function routePage(docId,pageId,viewport) {

        var pageNumber = Math.floor(parseInt(pageId,10));

        if (currentDocId != docId) {
            events.trigger('changeDocumentAndPage',{
                docId:docId,
                pageNumber:pageNumber
            });
        } else if (currentPageNumber != pageNumber) {
            events.trigger('changePage',{
                pageNumber:pageNumber
            });
        }
        currentDocId = docId;
        currentPageNumber = pageNumber;
        changePageInProgress = {
            docId: docId,
            pageNumber: pageNumber,
            viewport: viewport
        }

    }

    router.on("route:pageVP", routePage);

    events.on('newViewport',function newViewport(vp) {

        if (changePageInProgress) return;

        var parts = Backbone.history.fragment.split('/');
        var viewRoute = vp.originX + 'x' + vp.originY + 'x' + vp.pageScale +
            'x' + (vp.vertical ? 'V' : 'H');
        var route = parts[0] + '/' + parts[1] + '/' + viewRoute;
        router.navigate(route,{replace:true,trigger:false});

    });

    events.on('changePageDone',function (data) {

        // once everything is done, navigate to savedFragment
        var parts = Backbone.history.fragment.split('/');
        var route = parts[0] + '/' + data.pageNumber;
        var viewport = parts[2];
        if (viewport !== undefined) {
            var vParts = viewport.split('x');
            route += '/' + viewport;
            if (vParts.length == 4) {
                var vp = {
                    originX: parseInt(vParts[0],10),
                    originY: parseInt(vParts[1],10),
                    pageScale: parseFloat(vParts[2]),
                    vertical: vParts[3] == 'V' ? true : false
                };
                events.trigger('newViewportRequest',vp);
            }
        }

        changePageInProgress = undefined;
        router.navigate(route,{replace:true,trigger:false});

    });



    return {
        // expose these for testing
        fragment: Backbone.history.fragment,
        router: router
    };

});



