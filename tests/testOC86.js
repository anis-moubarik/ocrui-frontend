var settings = require('./settings');
var myutils = require('./myutils');
var utils = require('utils');
var casper = require('casper').create(myutils.debugOptions);
var url = settings.url+'#'+settings.testItem+'/11';

var cursor;

casper.start(url);

casper.log("OC-62: Virtuaalinäppäimistö: klikattava näppäin tulee editoriin, kielen vaihtaminen vaihtaa näppäimistön halutuksi","info");

casper.then(function() {
    casper.test.assertExists('#vkeyboard');
});

casper.waitForSelector("#language-selector",null,function() {
    var r = casper.evaluate(function() {
        var r = require('router').fragment;
        console.log('r:',r);
        return r;
    });
    casper.log(r);
    casper.die();
});

casper.then(function() {
    casper.evaluate(function() {console.log('loppa');});
    casper.test.assertExists('#language-selector');
});

casper.waitForText( "Pienet" ); // ensure editor is there

casper.then(function() {
    var selectorButton = casper.getElementInfo("#language-selector a");
    var selectorText = selectorButton.text.replace(/\s+/g, '');
    casper.test.assertEqual(selectorText,'');
});
casper.then(function() {
    casper.evaluate(function() {
        console.log('setting timeout');
        setTimeout(function() {console.log("timeout joo.");}, 200);
    });
});

casper.then(function() {
    cursor = casper.getElementBounds(".CodeMirror-cursor");
    var x = 900;
    var y = 480;
    casper.capture('layout.png');
    casper.log('cursor originally:' + JSON.stringify(cursor));
    casper.log('click '+x+' '+y);
    casper.page.sendEvent('click',x,y); // on word 'sylikummit'
});

// Wait for cursor to change from original
casper.waitFor(function () {

    var bounds = casper.getElementBounds(".CodeMirror-cursor");

    casper.log('new cursor:' + JSON.stringify(bounds));
    var slice = casper.evaluate(function() {
        console.log('xx');
        try {
            var content = require('editor').view.cMirror.getValue();
        } catch(e)  {
            console.log('yy',e);
        }
        console.log('aa');
        var cursor = require('editor').view.cMirror.getCursor();
        console.log('zz');
        var i = cursor.ch;
        var slice = content.substring(i-5,i+5);
        return slice;
    });
    casper.log(slice);
    if (myutils.cmpObjects(bounds,cursor)) { return false; }
    return true;

});

casper.then(function() {
    var selectorButton = casper.getElementInfo("#language-selector a");
    var selectorText = selectorButton.text.replace(/\s+/g, '');
    casper.test.assertEqual(selectorText,'Vepsä');
});

casper.run(function() {
    casper.test.done();
    casper.exit();
});


