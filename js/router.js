define(['events','backbone'], function (events,Backbone) {
    "use strict";

    var previousPageNumber;
    var currentPageNumber;
    var previousDocId;
    var currentDocId;
    var currentMode;
    var currentVP;
    var changePageInProgress;
    var router;

    var Router = Backbone.Router.extend({
        initialize: function () {
            var that = this;

            events.on('newViewport',function (vp) { that.newViewport(vp) });
            events.on('appReady', function() { Backbone.history.start(); });
            events.on('changeMode', function(mode) { that.changeMode(mode); });
            events.on('changePageDone',function (data) { that.changePageDone(data); });

        },
        routes:{
            "": "default",
            ":id": "document",
            ":id/": "document",
            ":id/:page": "page",
            ":id/:page/": "page",
            ":id/:page/:viewport": "page"
        },
        default: function () {

            events.trigger('changeMode','browser');

        },

        document: function (docId) {

            previousDocId = currentDocId;
            currentDocId = docId;
            events.trigger('changeMode','document');
            events.trigger('changeDocument',{
                docId: docId,
                pageNumber: undefined
            });

        },
        
        page: function (docId,pageId,viewport) {

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

        },

        newViewport: function (vp) {

            if (changePageInProgress) return;
            if (currentMode != "page") return;

            currentVP = vp;

            var parts = Backbone.history.fragment.split('/');
            var viewRoute = encodeVP(vp);
            var route = parts[0] + '/' + parts[1] + '/' + viewRoute;
            router.navigate(route,{replace:true,trigger:false});

        },

        changeMode:  function(mode) {
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
                    var route = currentDocId + '/' + currentPageNumber;
                    if (currentVP !== undefined) {
                        route += '/' + encodeVP(currentVP);
                        events.trigger('newViewportRequest',currentVP);
                    }
                    router.navigate(route,{replace:true,trigger:false});
                }
            }

        },

        changePageDone: function (data) {

            // once everything is done, navigate to savedFragment
            var parts = Backbone.history.fragment.split('/');
            var route = parts[0] + '/' + data.pageNumber;
            var viewport = parts[2];
            var vp = decodeVP(viewport);
            if (vp !== undefined) {
                route += '/' + viewport;
                currentVP = vp;
                events.trigger('newViewportRequest',vp);
            }
            changePageInProgress = undefined;
            router.navigate(route,{replace:true,trigger:false});

        }

    });

    router = new Router();
    function decodeVP(string) {

        if (string === undefined) return;

        var parts = string.split('x');

        if (parts.length != 4) return;

        return {
            originX: parseInt(parts[0],10),
            originY: parseInt(parts[1],10),
            pageScale: parseFloat(parts[2]),
            vertical: parts[3] == 'V' ? true : false
        };

    }

    function encodeVP(vp) {

        return vp.originX + 'x' +
            vp.originY + 'x' +
            vp.pageScale + 'x' +
            (vp.vertical ? 'V' : 'H');

    }


    return {
        // expose these for testing
        fragment: Backbone.history.fragment,
        router: router
    };

});



