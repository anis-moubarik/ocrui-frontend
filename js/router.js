define(['backbone','ocrui'],function (backbone,ocrui) {

    var Router = Backbone.Router.extend({
        routes:{
            "": "default",
            ":id": "document",
            ":id/:page": "page",
        }
    });

    var router = new Router();
    router.on("route:default",ocrui.empty);
    router.on("route:document",ocrui.doc);
    router.on("route:page",ocrui.page);

    return {
        router:router,
    };

});
