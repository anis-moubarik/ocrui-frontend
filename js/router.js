define(['backbone','ocrui'],function (backbone,ocrui) {

    var Router = Backbone.Router.extend({
        routes:{
            "": "default",
            ":id": "document",
            ":id/:page": "page",
        }
    });

    var router = new Router();
    router.on("route:default",ocrui.route_empty);
    router.on("route:document",ocrui.route_doc);
    router.on("route:page",ocrui.route_page);

    function gotoPage(pageNumber) {

        var parts = Backbone.history.fragment.split('/');
        var route = parts[0]+'/'+pageNumber;
        router.navigate(route,{replace:true,trigger:true});
    };

    return {
        gotoPage:gotoPage,
    };

});
