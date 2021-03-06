casper.echo( "OC-68: Klikattaessa faksimiilia editorin kursori siityy oikeaan kohtaan" );

var settings     = require('./settings');
var mytests      = require('./mytests');


var cursor;

casper.start(settings.defaultPageUrl);

casper.then(function() {
    this.test.assertExists('#boxes');
});

casper.waitForText( "Pienet",
    function () { casper.test.assert(true, "Found editor text");},
    function () {
        casper.test.assert(false, "Editor text not found.");
        casper.capture('failed.png');
        casper.test.done();
    });

casper.then(function() {
    cursor = casper.getElementBounds(".CodeMirror-cursor");
    var x = 450;
    var y = 660;
    this.echo('cursor originally:' + JSON.stringify(cursor));
    this.echo('click',x,y);
    this.page.sendEvent('click',x,y); // on word 'sylikummit'
});

// Wait for cursor to change from original
casper.waitFor(function () {

    var bounds = casper.getElementBounds(".CodeMirror-cursor");

    if (mytests.cmpObjects(bounds,cursor)) { return false; }
    return true;

});

casper.then(function() {

    var expectedBounds = {
        "height": 0,
        "left": 0,
        "top": 0,
        "width": 0
    };

    var bounds = casper.getElementBounds(".CodeMirror-cursor");
    mytests.assertEqualObjects(casper.test,bounds,expectedBounds);

    var expectedBounds2 = {
        "height": 14,
        "left": 608,
        "top": 196,
        "width": 69
    };

    casper.capture('failed.png');
    var bounds2 = casper.getElementBounds(".CodeMirror-selected");
    mytests.assertEqualObjects(casper.test,bounds2,expectedBounds2);

});

casper.run(function() {
    this.test.done();
});


