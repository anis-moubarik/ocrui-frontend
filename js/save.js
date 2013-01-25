
define(['events','toolbar'], function (events,toolbar) {

    var doc;

    toolbar.registerButton({
        id:"save",
        toggle:false,
        text:"Save",
        title:"Save",
        modes:["page"],
        click: function () {
            var dirtyPages = doc.dirtyPages();
            console.log('dirty pages:' + (dirtyPages.join(' ')));


            console.log('should now PUT');
        }
    });

    events.on('changePageMets', function (newDoc) {
        doc = newDoc;
    });


});
