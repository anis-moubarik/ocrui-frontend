var testName = "OC-68: Klikattaessa faksimiilia editorin kursori siityy oikeaan kohtaan"

var settings = require('./settings');
var mytests = require('./mytests');
var utils = require('utils');
var casper = require('casper').create(mytests.normalOptions);
var url = settings.url+'#'+settings.testItem+'/11';


var cursor;

casper.start(url,mytests.initCasper(testName));

casper.then(function() {
    this.test.assertExists('#boxes');
});

casper.waitForText( "Pienet",
    function () { casper.test.assert(true, "Found editor text");},
    function () {
        casper.test.assert(true, "Editor text not found.");
        casper.die();
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
        "height": 18,
        "left": 845,
        "top": 80,
        "width": 9
    }

    var bounds = casper.getElementBounds(".CodeMirror-cursor");
    this.echo('new cursor:' + JSON.stringify(bounds));
    this.test.assert(mytests.cmpObjects(bounds,expectedBounds),
        "Cursor moves to right place");
});

casper.run(function() {
    this.test.done();
    this.exit();
});


