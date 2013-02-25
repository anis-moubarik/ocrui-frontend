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

    var previousPageNumber;
    var currentPageNumber;
    var previousDocId;
    var currentDocId;
    var currentMode;
    var currentVP = {};
    var changePageInProgress;
    var router = new Router();

    router.on("route:default", function routeEmpty() {

        events.trigger('changeMode','browser');

    });

    router.on("route:document", function routeDoc(docId) {

        previousDocId = currentDocId;
        currentDocId = docId;
        events.trigger('changeMode','document');
        events.trigger('changeDocument',{
            docId: docId,
            pageNumber: undefined
        });

    });
    
    router.on("route:page", routePage);
    function routePage(docId,pageId,viewport) {

        previousDocId = currentDocId;
        currentDocId = docId;
        previousPageNumber = currentPageNumber;
        currentPageNumber = Math.floor(parseInt(pageId,10));
        changePageInProgress = {
            docId: docId,
            pageNumber: currentPageNumber,
            viewport: viewport
        }

        events.trigger('changeMode','page');

    }

    router.on("route:pageVP", routePage);

    events.on('newViewport',function newViewport(vp) {

        if (changePageInProgress) return;
        if (currentMode != "page") return;

        currentVP = vp;

        var parts = Backbone.history.fragment.split('/');
        var viewRoute = vp.originX + 'x' + vp.originY + 'x' + vp.pageScale +
            'x' + (vp.vertical ? 'V' : 'H');
        var route = parts[0] + '/' + parts[1] + '/' + viewRoute;
        router.navigate(route,{replace:true,trigger:false});

    });

    events.on('appReady', function() { Backbone.history.start(); });
    events.on('changeMode', function(mode) {
        currentMode = mode;
        if (mode == 'document') {
            router.navigate('#'+currentDocId,{replace:true,trigger:false});
        } else  {
            if (currentDocId != previousDocId) {
                events.trigger('changeDocument',{
                    docId: currentDocId,
                    pageNumber: currentPageNumber
                });
            } else if (currentPageNumber != previousPageNumber) {
                events.trigger('changePage',{
                    pageNumber:currentPageNumber
                });
            } else {

                var parts = Backbone.history.fragment.split('/');
                var route = currentDocId + '/' + currentPageNumber + '/' + currentVP;;
                events.trigger('newViewportRequest',currentVP);
                router.navigate(route,{replace:true,trigger:false});
            }
        }

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
                currentVP = vp;
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



