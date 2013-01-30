var settings = require('./settings');
var myutils = require('./myutils');
var utils = require('utils');
var casper = require('casper').create(myutils.normalOptions);
var url = settings.url+'#'+settings.testItem+'/11';


var cursor;

casper.start(url);

casper.echo("OC-62: Virtuaalinäppäimistö: klikattava näppäin tulee editoriin, kielen vaihtaminen vaihtaa näppäimistön halutuksi");

casper.then(function() {
    this.test.assertExists('#vkeyboard');
});

casper.waitForSelector("#language-selector");

casper.then(function() {
    this.test.assertExists('#language-selector');
});

casper.waitForText( "Pienet" ); // ensure editor is there

casper.then(function() {
    var selectorButton = this.getElementInfo("#language-selector a");
    casper.echo("T: ");
    casper.echo(selectorButton.text);
    casper.echo(selectorButton.html);
});
casper.then(function() {
    casper.page.evaluate(function() {
        setTimeout(function() {console.log("timeout joo.");}, 1000);
    });
});

casper.then(function() {
    cursor = casper.getElementBounds(".CodeMirror-cursor");
    var x = 700;
    var y = 605;
    this.echo('cursor originally:' + JSON.stringify(cursor));
    this.echo('click',x,y);
    this.page.sendEvent('click',x,y); // on word 'sylikummit'
});

// Wait for cursor to change from original
casper.waitFor(function () {

    var bounds = casper.getElementBounds(".CodeMirror-cursor");

    this.echo('new cursor:' + JSON.stringify(bounds));
    var slice = this.evaluate(function() {
        var content = require('editor').view.cMirror.getContent();
        var cursor = require('editor').view.cMirror.getCursor();
        var i = cursor.ch;
        var slice = content.substring(i-5,i+5);
        return content;
    });
    this.echo(slice);
    if (myutils.cmpObjects(bounds,cursor)) { return false; }
    return true;

});

casper.then(function() {
    var selectorButton = this.getElementInfo("#language-selector a");
    casper.echo("T: "+selectorButton.text);
});

casper.run(function() {
    this.test.done();
    this.exit();
});


