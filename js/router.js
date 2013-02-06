define(['events','mets','backbone'],
        function (events,mets,Backbone) {
    "use strict";

    var facsimileRendered = undefined;
    var editorRendered = undefined;

    events.on('facsimileRendered', function () { facsimileRendered.resolve(); });

    events.on('facsimileRenderError', function () { facsimileRendered.reject(); });

    events.on('editorRendered', function () { editorRendered.resolve(); });

    events.on('editorRenderError', function () { editorRendered.reject(); });

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

        var data = {
            docId:docId,
            pageNumber:Math.floor(parseInt(pageId,10))
        };

        /* clear earlier deferred callbacks before starting */
        if (facsimileRendered !== undefined) {
            facsimileRendered.reject();
        }
        if (editorRendered !== undefined) {
            editorRendered.reject();
        }

        /* create new deferreds. they will be fired by event
         * handlers when being notified of a rendre
         */
        facsimileRendered = new $.Deferred();
        editorRendered = new $.Deferred();

        events.trigger('changePage',data);
        events.trigger('nowProcessing',"page-change");

        mets.get(data).then(
            function(doc) { events.trigger('changePageMets',doc); },
            function(msg) { events.trigger('changePageMetsError',msg); });

        $.when(facsimileRendered,editorRendered).then(
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



