var Router = Backbone.Router.extend({

    routes:{
        "": "default",
        "koe": "default",
        ":id": "document",
        ":id/:page": "page",
    }
});

var router = new Router();

router.on("route:default",function() {

        facsimileView.render();
        editorView.render();

    });

router.on("route:document",function(id) {

        router.navigate("page",{replace:true,trigger:tru});

    });

router.on("route:page",function(id,page) {
        var options = {
            id: id,
            page: page,
        }

        facsimileView.render(options)
        editorView.render(options)
    });

