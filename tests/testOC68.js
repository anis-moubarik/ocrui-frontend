// OC-68 Klikattaessa faksimiilia editorin kursori siityy oikeaan kohtaan

var settings = require('./settings');
var myutils = require('./myutils');
var utils = require('utils');
var casper = require('casper').create({ });
var url = settings.url+'#'+settings.testItem+'/11';


var cursor;

function getHLB() {
    return window.testing.boxes.view.highlight;
}

function getEditorContent() {
    return window.testing.editor.view.cMirror.getValue();
}


function moveCursor () {
    testing.renderedHighlightBoxes = undefined;
    /*
    window.events.on('highlightBoxesRendered',function(data) {
        testing.renderedHighlightBoxes = data
    });
    */
    // beginning of word "kuva"
    testing.editor.view.cMirror.setCursor(0,120);
    return testing.editor.view.cMirror.getCursor();
}


casper.start(url);

casper.viewport(1024,768);

casper.then(function() {
    this.page.onConsoleMessage = myutils.onConsoleMessage;
    this.page.onError = myutils.onError;
    this.test.assertExists('#boxes');
});

casper.waitForText( "Pienet" ); // ensure editor is there

casper.then(function() { casper.echo("Found editor text");});

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

    if (myutils.cmpObjects(bounds,cursor)) { return false; }
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
    this.test.assert(myutils.cmpObjects(bounds,expectedBounds),
        "Cursor moves to right place");
});

casper.run(function() {
    this.test.done();
    this.exit();
});


