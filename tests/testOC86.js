casper.echo( "OC-86: kielivalitsin, editorin kursorin alla olevan sanan kieli näkyy kielivalitsimessa oikein." );


var cursor;

casper.start(settings.defaultPageUrl,mytests.initCasper());

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
    var selectedLang = casper.getElementInfo("#language-selector select option[selected]");
    var lang = selectedLang.attributes.value;
    casper.test.assert(lang=='', "No language selected");
    cursor = casper.getElementBounds(".CodeMirror-cursor");
    var x = 900;
    var y = 480;
    casper.log('cursor originally:' + JSON.stringify(cursor));
    casper.log('click '+x+' '+y);
    casper.page.sendEvent('click',x,y); // on word 'sylikummit'
});

// Wait for cursor to change from original
casper.waitFor(function () {

    var bounds = casper.getElementBounds(".CodeMirror-cursor");

    casper.log('new cursor:' + JSON.stringify(bounds));
    if (mytests.cmpObjects(bounds,cursor)) { return false; }
    return true;

});

casper.then(function() {
    var selectedLang = casper.getElementInfo("#language-selector select option[selected]");
    var lang = selectedLang.attributes.value;
    casper.test.assert(lang=='veps', "Vepsä language selected");
    casper.capture('koe.png');
});

casper.run(function() {
    this.test.done();
    this.test.renderResults();
});


