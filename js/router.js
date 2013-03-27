define(['events','backbone'], function (events,Backbone) {
    "use strict";

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

            this.previousDocId = this.currentDocId;
            this.currentDocId = docId;
            events.trigger('changeMode','document');
            events.trigger('changeDocument',{
                docId: docId,
                pageNumber: undefined
            });

        },
        
        page: function (docId,pageId,viewport) {

            this.previousDocId = this.currentDocId;
            this.currentDocId = docId;
            this.previousPageNumber = this.currentPageNumber;
            this.currentPageNumber = Math.floor(parseInt(pageId,10));
            this.changePageInProgress = {
                docId: docId,
                pageNumber: this.currentPageNumber,
                viewport: viewport
            }

            events.trigger('changeMode','page');

        },

        newViewport: function (vp) {

            if (this.changePageInProgress) return;
            if (this.currentMode != "page") return;

            this.currentVP = vp;

            var parts = Backbone.history.fragment.split('/');
            var viewRoute = encodeVP(vp);
            var route = parts[0] + '/' + parts[1] + '/' + viewRoute;
            router.navigate(route,{replace:true,trigger:false});

        },

        changeMode:  function(mode) {
            this.currentMode = mode;
            if (mode == 'document') {
                router.navigate('#'+this.currentDocId,{replace:true,trigger:false});
            } else  {
                if (this.currentDocId != this.previousDocId) {
                    events.trigger('changeDocument',{
                        docId: this.currentDocId,
                        pageNumber: this.currentPageNumber
                    });
                } else if (this.currentPageNumber != this.previousPageNumber) {
                    events.trigger('changePage',{
                        pageNumber:this.currentPageNumber
                    });
                } else {

                    var parts = Backbone.history.fragment.split('/');
                    var route = this.currentDocId + '/' + this.currentPageNumber;
                    if (this.currentVP !== undefined) {
                        route += '/' + encodeVP(this.currentVP);
                        events.trigger('newViewportRequest',this.currentVP);
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
                this.currentVP = vp;
                events.trigger('newViewportRequest',vp);
            }
            this.changePageInProgress = undefined;
            router.navigate(route,{replace:true,trigger:false});

        }

    });

    var router = new Router();

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



